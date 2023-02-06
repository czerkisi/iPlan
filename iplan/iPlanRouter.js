const express = require('express');
const mongoose = require('mongoose');
const validator = require("validator");

mongoose.connect('mongodb://localhost/iplan', { useNewUrlParser: true });

const app = express();
app.use(express.json());

Event = new mongoose.Schema({
    summary: {
        type: String,
        required: [true, "Event summary is required"],
        minlength: [5, "Event summary must have at least 5 characters"],
        maxlength: [100, "Event summary cannot have more than 100 characters"],
    },
    start: {
        type: Date,
        required: [true, "Event start date is required"],
        validate: {
            validator: function (value) {
                return value >= this.created;
            },
            message: "Event start date must be after the created date",
        },
    },
    end: {
        type: Date,
        required: [true, "Event end date is required"],
        validate: {
            validator: function (value) {
                return value > this.start;
            },
            message: "Event end date must be after the start date",
        },
    },
    stamp: {
        type: Date,
        default: new Date(),
        immutable: true,
    },
    description: {
        type: String,
        default: "",
        maxlength: [1000, "Event description cannot have more than 1000 characters"],
    },
    location: {
        type: String,
        default: "",
        maxlength: [100, "Event location cannot have more than 100 characters"],
    },
    status: {
        type: String,
        default: "CONFIRMED",
        enum: ["TENTATIVE", "CONFIRMED", "CANCELLED"],
    },
    organizer: {
        type: String,
        default: "",
        maxlength: [100, "Event organizer cannot have more than 100 characters"],
    },
    attendees: [{
        type: String,
        default: [],
        maxlength: [100, "Attendee email address cannot have more than 100 characters"],
        validate: [validator.isEmail, "Invalid attendee email address"],
    }],
    uid: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, "Event uid must have at least 5 characters"],
        maxlength: [100, "Event uid cannot have more than 100 characters"],
    },
    sequence: {
        type: Number,
        default: 0,
        min: [0, "Event sequence number cannot be negative"],
    },
    created: {
        type: Date,
        default: new Date(),
    },
    lastModified: {
        type: Date,
        default: new Date(),
        validate: {
            validator: function (value) {
                return value >= this.created;
            },
            message: "Last modified date must be after the created date",
        },
    },
    recurrenceId: {
        type: String,
        default: "",
        maxlength: [100, "Event recurrenceId cannot have more than 100 characters"],
    },
    recurrenceRule: {
        type: String,
        default: "",
        maxlength: [1000, "Event recurrenceRule cannot have more than 1000 characters"],
    },
    recurrenceException: {
        type: [Date],
        default: [],
    },
    alarm: {
        type: Object,
        default: {},
        validate: {
            validator: function (value) {
                return value.action && value.trigger;
            },
            message: "Alarm must have 'action' and 'trigger' properties",
        },
    },
});


const CalendarSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    events: [Event],
    productId: {
        type: String,
        default: function() {
            return `-//iPlan API//NONSGML ${this.username}//EN`;
        }
    },
    version: {
        type: String,
        default: "2.0",
    },
    calscale: {
        type: String,
        default: "GREGORIAN",
    },
    method: {
        type: String,
        default: "PUBLISH",
    },
});

const calendarModel = mongoose.model('ICal', CalendarSchema);

app.get('/events', (req, res) => {
    const username = req.query.username;
    if (!username){
        return res.status(400).send({ error: 'Missing username parameter' });
    }

    // retrieve the iCal file with the specified ID from MongoDB
    calendarModel.findOne({ username: username })
        .then((icalDoc) => {
            if (!icalDoc){
                return res.status(404).send({ error: 'iCal file not found' });
            }
            return res.status(200).send({ events: icalDoc.events});
        })
        .catch((err) => {
            return res.status(500).send({ error: 'Error retrieving events from database' });
        });
});

app.post('/events', (req, res) => {
    const username = req.query.username;
    if (!username){
        return res.status(400).send({ error: 'Missing username parameter' });
    }
    const data = req.body;
    if (!data){
        return res.status(400).send({ error: 'Missing Body' });
    }
    calendarModel.findOne({ username: username })
        .then(calendar => {
            if (!calendar) {
                return res.status(400).send({ error: `User does not exist` });
            }
            calendar.events.push(data);
            return calendar.save();
        })
        .then(calendar => {
            return res.status(201).send({ calendar: calendar });
        })
        .catch(error => {
            return res.status(500).send({ error: `iCal Event was not added: ${error.message}` });
        });
});

app.put('/events', (req, res) => {
    const username = req.query.username;
    if (!username){
        return res.status(400).send({ error: 'Missing username parameter' });
    }
    const data = req.body;
    if (!data){
        return res.status(400).send({ error: 'Missing data in Body' });
    }
    const eventId = req.query.eventId;
    if (!eventId){
        return res.status(400).send({ error: 'Missing eventId in query parameter' });
    }

    calendarModel.findOne({ username: username })
        .then(calendar => {
            if (!calendar) {
                return res.status(400).send({ error: `User does not exist` });
            }
            const existingEventIndex = calendar.events.findIndex(e => e.uid === eventId);
            if (existingEventIndex === -1) {
                return res.status(400).send({ error: `Event does not exist` });
            }
            calendar.events[existingEventIndex] = data;
            return calendar.save();
        })
        .then(calendar => {
            return res.status(200).send({ calendar: calendar });
        })
        .catch(error => {
            return res.status(500).send({ error: `iCal Event was not updated: ${error.message}` });
        });
});

app.delete('/events', (req, res) => {
    const username = req.query.username;
    if (!username){
        return res.status(400).send({ error: 'Missing username parameter' });
    }
    const eventId = req.query.eventId;
    if (!eventId){
        return res.status(400).send({ error: 'Missing eventId in query parameter' });
    }

    calendarModel.findOne({ username: username })
        .then(calendar => {
            if (!calendar) {
                return res.status(400).send({ error: 'User does not exist' });
            }
            const eventIndex = calendar.events.findIndex(event => event.uid === eventId);
            if (eventIndex === -1) {
                return res.status(400).send({ error: `Event with id ${eventId} does not exist` });
            }
            calendar.events.splice(eventIndex, 1);
            return calendar.save();
        })
        .then(calendar => {
            return res.status(200).send({ calendar: calendar });
        })
        .catch(error => {
            return res.status(500).send({ error: `iCal Event was not deleted: ${error.message}` });
        });
});

app.get('/:username.ics', (req, res) => {
    const username = req.params.username;

    iCalFile(username)
        .then((icalFile) => {
            return res.set('Content-Type', 'text/calendar').send(icalFile);
        }).catch(error => {
        console.log(error)
        return res.status(500).send({ error: `Could not retrieve iCal: ${error.message}` });
    });
});

iCalFile = async (username) => {
    const calendar = await calendarModel.findOne({ username });

    let icalendar = "BEGIN:VCALENDAR\n";
    icalendar += "PRODID:" + calendar.productId + "\n";
    icalendar += "VERSION:2.0\n";

    calendar.events.forEach(event => {
        icalendar += "BEGIN:VEVENT\n";
        icalendar += "SUMMARY:" + event.summary + "\n";
        icalendar += "DTSTAMP:" + formatDate(event.stamp) + "\n";
        icalendar += "DTSTART:" + formatDate(event.start) + "\n";
        icalendar += "DTEND:" + formatDate(event.end) + "\n";
        icalendar += "DESCRIPTION:" + event.description + "\n";
        icalendar += "LOCATION:" + event.location + "\n";
        icalendar += "STATUS:" + event.status + "\n";
        icalendar += "ORGANIZER:" + event.organizer + "\n";
        icalendar += "ATTENDEE:" + event.attendees.join(",") + "\n";
        icalendar += "UID:" + event.uid + "\n";
        icalendar += "SEQUENCE:" + event.sequence + "\n";
        icalendar += "END:VEVENT\n";
    });

    icalendar += "END:VCALENDAR";

    return icalendar;
};


const formatDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, "");
};

app.post('/create', (req, res) => {
    const username = req.query.username;
    if (!username){
        return res.status(400).send({ error: 'Missing username parameter' });
    }

    const iCal = new calendarModel({
        username: username,
        events: []
    });

    iCal.save()
        .then(calendar => {
            return res.status(201).send({ calendar: calendar });
        })
        .catch(error => {
            return res.status(500).send({ error: `iCal Calendar was not created: ${error.message}` });
        });
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});

