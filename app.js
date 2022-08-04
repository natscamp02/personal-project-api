const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const indexRouter = require('./routes/base');
const globalErrorHandler = require('./controllers/errorController');

// Creating the app
const app = express();

// CORS
app.use(cors('*'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.json());

// Logging requests
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Routes
app.use('/api/v1/', indexRouter);

// Error handlers
app.all('*', (req, _, next) => next(new Error(`${req.originalUrl} not found`)));
app.use(globalErrorHandler);

module.exports = app;
