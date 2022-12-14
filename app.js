const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const bookingsRouter = require('./routes/bookingsRouter');
const userRouter = require('./routes/userRouter');
const globalErrorHandler = require('./controllers/errorController');
const { AppError } = require('./utils/appError');

// Setting up the Express app
const app = express();
app.set('trust proxy', 1);

// CORS
app.use(cors(['*']));

// Serving static files
app.use(express.static('public'));

// Body and cookie parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Logging requests
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.all('/', (_, res) => res.sendStatus(200));

// Error handlers
app.all('*', (req, _, next) => next(new AppError(`${req.originalUrl} not found`)));
app.use(globalErrorHandler);

module.exports = app;
