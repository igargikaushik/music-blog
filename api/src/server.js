const express = require('express');
const bodyParser = require('body-parser');
const { passport, pg_session } = require('./middleware/auth.js');

const app = express();

// Sessions middleware
app.set('trust proxy', 1);
app.use(pg_session);
app.use(passport.initialize());
app.use(passport.session());

// Parsing middleware
app.use(require('cookie-parser')());
app.use(bodyParser.json());

// Endpoints
app.use('/api', require('./routes'));

module.exports = app;