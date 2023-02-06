iPlan API Documentation
=======================

The iPlan API is a RESTful API for managing events on a calendar. It uses [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/) for the server and [MongoDB](https://www.mongodb.com/) as the database. This API uses [Mongoose](https://mongoosejs.com/) as the ODM (Object Document Mapper) for MongoDB.

Prerequisites
-------------

*   Node.js
*   Express
*   MongoDB
*   Mongoose
*   validator

Installation
------------

1.  Clone the repository:

`git clone https://github.com/czerkisi/iPlan.git`

2.  Install the dependencies:

`npm install`

Connecting to MongoDB
---------------------

The API connects to a local instance of MongoDB with the following line of code:

`mongoose.connect('mongodb://localhost/iplan', { useNewUrlParser: true });`

Event Model
-----------

An event is an instance of the `Event` schema with the following fields:

*   `summary`: a brief description of the event. (String, required, minimum length: 5, maximum length: 100)
*   `start`: the start date of the event. (Date, required, must be after the `created` date)
*   `end`: the end date of the event. (Date, required, must be after the `start` date)
*   `stamp`: the timestamp of the event creation. (Date, default: current date, immutable)
*   `description`: a detailed description of the event. (String, default: "", maximum length: 1000)
*   `location`: the location of the event. (String, default: "", maximum length: 100)
*   `status`: the status of the event (String, default: "CONFIRMED", enum: \["TENTATIVE", "CONFIRMED", "CANCELLED"\])
*   `organizer`: the organizer of the event. (String, default: "", maximum length: 100)
*   `attendees`: an array of attendees' email addresses. (Array, default: \[\], maximum length of an element: 100, must be a valid email address)
*   `uid`: a unique identifier for the event. (String, required, unique, minimum length: 5, maximum length: 100)
*   `sequence`: the sequence number of the event. (Number, default: 0, minimum value: 0)
*   `created`: the date of the event creation. (Date, default: current date)
*   `lastModified`: the date of the last modification to the event. (Date, default: current date, must be after the `created` date)
*   `recurrenceId`: the identifier for a recurrence event. (String, default: "", maximum length: 100)
*   `recurrenceRule`: the recurrence rule for the event. (String, default: "", maximum length: 1000)
*   `recurrenceException`: an array of dates that define exceptions to a recurring event. (Array of dates, default: \[\])
*   `alarm`: an object that represents an alarm for the event. (Object, default: {}, must have `action` and `trigger` properties)

Calendar Model
--------------

A calendar is an instance of the `Calendar` schema with the following fields:

*   `username`: A string representing the username associated with the calendar. (String, required, unique, minimum length: 5, maximum length: 100)
*   `events`: An array of Event objects that are associated with the calendar. (Array, default: [])
*   `productId`: A string representing the product ID of the iPlan API. It is generated using the username property. (String, default: "-//iPlan API//NONSGML **username**//EN", maximum length: 100)
*   `version`: A string representing the version of the iCal file, with a default value of "2.0". (String, default: "2.0", maximum length: 5)
*   `calscale`: A string representing the calendar scale, with a default value of "GREGORIAN". (String, default: "GREGORIAN", maximum length: 10)
*   `method`: A string representing the method used to publish the iCal file, with a default value of "PUBLISH". (String, default: "PUBLISH", maximum length: 10)

Create an Account
---------------

`POST /create`

Creates a new calendar.

#### Query parameters

*   `username`: Required. The username associated with the calendar.

##### Response

*   On success, returns a 201 Created HTTP response with the newly created calendar.
*   On error, returns a 400 Bad Request HTTP response with an error message if the request body is invalid.

iCal (.ics) File
--------------

Retrieves all events in iCal (.ics) format associated with a user's calendar.

### Request

`GET /:username.ics`

#### URL parameters

*   `username`: Required. The username associated with the calendar.

### Response

#### 200 OK

*   Returns an iCal (.ics) File with the events associated with the user's calendar.

#### 400 Bad Request

*   Returns an error message if the `username` query parameter is invalid.

See all events
--------------

Retrieves all events in JSON format associated with a user's calendar.

### Request

`GET /events`

#### Query parameters

*   `username`: Required. The username associated with the calendar.

### Response

#### 200 OK

*   Returns a JSON object with the events associated with the user's calendar.

#### 400 Bad Request

*   Returns an error message if the `username` query parameter is missing.

Create a new event
------------------

Adds a new event to a user's calendar.

### Request

`POST /events`

#### Query parameters

*   `username`: Required. The username associated with the calendar.

#### Body parameters

*   JSON body with the fields for the event. (See Event Model)

### Response

#### 201 Created

*   Returns a JSON object with the new event if the event was created successfully.

#### 400 Bad Request

*   Returns an error message if any of the required parameters are missing or invalid.

Update an event
---------------

Updates an existing event in a user's calendar.

### Request

`PUT /events/:id`

#### URL parameters

*   `id`: Required. The id of the event to be updated.

#### Query parameters

*   `username`: Required. The username associated with the calendar.

#### Body parameters

*   JSON body with the updated fields for the event. (See Event Model)

### Response

#### 200 OK

*   Returns a JSON object with the updated event if the event was updated successfully.

#### 400 Bad Request

*   Returns an error message if the event id is missing or any of the body parameters are missing or invalid.

Delete an event
---------------

Deletes an existing event based on its unique identifier (uid).

### Request

`DELETE /events/:id`

#### URL parameters

*   `uid` path parameter, the unique identifier of the event to be deleted.

#### Query parameters

*   `username`: Required. The username associated with the calendar.

##### Response

*   On success, returns a 204 No Content HTTP response.
*   On error, returns a 400 Bad Request HTTP response with an error message if the `uid` is invalid or missing.
*   On error, returns a 404 Not Found HTTP response with an error message if the event cannot be found.