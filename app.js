const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const bookingsRouter = require('./routes/bookingsRouter');
const userRouter = require('./routes/userRouter');
const globalErrorHandler = require('./controllers/errorController');

// Creating the app
const app = express();
app.set('trust proxy', 1);

// CORS
app.use(cors('*'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Body and cookie parsing
app.use(express.json());
app.use(cookieParser());

// Setting up the session
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			maxAge: 1 * 60 * 60 * 1000,
			secure: process.env.NODE_ENV === 'production',
		},
	})
);

// Logging requests
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingsRouter);

// Error handlers
app.all('*', (req, _, next) => next(new Error(`${req.originalUrl} not found`)));
app.use(globalErrorHandler);

module.exports = app;
