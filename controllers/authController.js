const util = require('util');
const User = require('../models/User');
const { ExpressCallback } = require('../utils');
const catchAsync = require('../utils/catchAsync');
const restrictFields = require('../utils/restrictFields');

/**
 *  Middleware that prevent unauthorized access to the subsequent routes
 *  @type {ExpressCallback}
 */
exports.protect = (req, res, next) => {
	if (!req.session.user) return next(new Error('You must be logged in to access this resource'));

	req.user = req.session.user;

	next();
};

/**
 *  Use to signup new users
 */
exports.signup = catchAsync(async (req, res, next) => {
	const data = restrictFields(req.body, 'name', 'email', 'password', 'confirm');
	const user = await User.create(data);

	user.password = undefined;
	req.session.user = user;
	res.status(201).json({ status: 'success', data: { user } });
});

/**
 *  Use to login existsing users
 */
exports.login = catchAsync(async (req, res, next) => {
	const data = restrictFields(req.body, 'email', 'password');
	const user = await User.findOne({ email: data.email }).select('+password');

	if (!user || !(await user?.correctPassword(data.password))) {
		return next(new Error('Email or password is incorrect'));
	}

	user.password = undefined;
	req.session.user = user;
	res.status(200).json({ status: 'success', data: { user } });
});

/**
 * Use to log out current users
 */
exports.logout = catchAsync(async (req, res, next) => {
	req.session.destroy((err) => {
		if (err) throw err;
		res.status(200).json({ status: 'success', data: { user: null } });
	});
});
