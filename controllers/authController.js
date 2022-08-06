const User = require('../models/User');
const { ExpressCallback } = require('../utils');
const catchAsync = require('../utils/catchAsync');
const restrictFields = require('../utils/restrictFields');

/**
 *  Middleware that prevent unauthorized access to the subsequent routes
 *  @type {ExpressCallback}
 */
exports.protect = (req, res, next) => {
	if (!req.user) return next(new Error('You must be logged in to access this resource'));

	next();
};

/**
 *  Handles signup requests
 */
exports.signup = catchAsync(async (req, res, next) => {
	const data = restrictFields(req.body, 'name', 'email', 'password', 'confirm');

	const user = await User.create(data);

	res.status(201).json({ status: 'success', data: { user } });
});

/**
 *  Handles login requests
 */
exports.login = catchAsync(async (req, res, next) => {
	const data = restrictFields(req.body, 'email', 'password');

	const user = await User.findOne({ email: data.email }).select('+password');
	if (!user || !(await user?.correctPassword(data.password))) {
		return next(new Error('Email or password is incorrect'));
	}

	user.password = undefined;
	req.user = user;

	res.status(200).json({ status: 'success', data: { user } });
});
