const { promisify } = require('util');
const JWT = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const restrictFields = require('../utils/restrictFields');
const { AppError, ValidationError } = require('../utils/appError');

function signToken(id) {
	return JWT.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

function createAndSendToken(user, status, req, res) {
	// Create a new token
	const token = signToken(user._id);

	// Send a cookie with the response
	const sessionExpiryDate = new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000);
	res.cookie('jwt', token, {
		expires: sessionExpiryDate,
		httpOnly: true,
		secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
	});

	// Remove the password from the response
	user.password = undefined;

	// Send the response
	res.status(status).json({ status: 'success', data: { token: { value: token, expires: sessionExpiryDate }, user } });
}

/**
 *  Middleware that prevent unauthorized access to the subsequent routes
 */
exports.protect = catchAsync(async (req, res, next) => {
	// Check if the request has a token
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.get('Authorization')?.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	if (!token) return next(new AppError('You must be logged in to access this resource', 401));

	// Check if the token is valid
	const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});

	// Check if the user still exists
	const user = await User.findById(decoded.id);
	if (!user) return next(new AppError('The user belonging this token no longer exists', 401));

	// Check if the user recently changed their password
	if (user.passwordChangedAfter(decoded.iat))
		return next(new AppError('User recently changed their password. Please log in again', 401));

	req.user = user;
	next();
});

/**
 *  Use to signup new users
 */
exports.signup = catchAsync(async (req, res, next) => {
	const data = restrictFields(req.body, 'name', 'email', 'password', 'confirm');
	const user = await User.create(data);

	createAndSendToken(user, 201, req, res);
});

/**
 *  Use to login existing users
 */
exports.login = catchAsync(async (req, res, next) => {
	const data = restrictFields(req.body, 'email', 'password');
	const user = await User.findOne({ email: data.email }).select('+password');

	if (!user) return next(new ValidationError(null, { email: 'Email is incorrect' }));
	if (!(await user?.correctPassword(data.password)))
		return next(new ValidationError(null, { password: 'Password is incorrect' }));

	createAndSendToken(user, 200, req, res);
});

/**
 * Use to log out current users
 */
exports.logout = catchAsync(async (req, res, next) => {
	res.cookie('jwt', '', {
		expires: new Date(Date.now() + 1000),
		httpOnly: true,
	});
	res.status(200).json({ status: 'success' });
});

////////////////////////////////////////////////////////////////
// ACCOUNT HANDLERS
////////////////////////////////////////////////////////////////

exports.getCurrentUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user._id);

	if (!user) return next(new AppError('User not found', 404));

	res.status(200).json({ status: 'success', data: { user } });
});

exports.verifyUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user._id).select('+password');

	if (!(await user.correctPassword(req.body.password)))
		return next(new ValidationError(null, { password: 'Password is incorrect' }));

	res.status(200).json({ status: 'success' });
});

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
	const data = restrictFields(req.body, 'name', 'email');
	const user = await User.findById(req.user._id);

	if (!user) return next(new AppError('User not found', 404));

	user.set(data);
	await user.save();

	res.status(200).json({ status: 'success', data: { user } });
});

exports.updateCurrentUserPassword = catchAsync(async (req, res, next) => {
	const data = restrictFields(req.body, 'currentPassword', 'password', 'confirm');
	const user = await User.findById(req.user._id).select('+password');

	if (!user) return next(new AppError('User not found', 404));

	// Check if the password is correct
	if (!(await user.correctPassword(data.currentPassword)))
		return next(new ValidationError(null, { currentPassword: 'Password is incorrect' }));

	// Set the new password
	user.set({
		password: data.password,
		confirm: data.confirm,
	});
	await user.save();

	createAndSendToken(user, 200, req, res);
});

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.user._id, { active: false });

	if (!user) return next(new AppError('User not found', 404));

	res.status(204).json({ status: 'success', data: { user: null } });
});
