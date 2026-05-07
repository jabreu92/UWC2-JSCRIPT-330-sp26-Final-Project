// App Code lives here in the server file 
const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('My Web App')
});

module.exports = app;