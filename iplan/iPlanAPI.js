const express = require('express');
const router = require('./iPlanRouter');

const app = express();
app.use(express.json());
app.use('/', router);

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});