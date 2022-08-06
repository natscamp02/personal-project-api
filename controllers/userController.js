const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const restrictFields = require('../utils/restrictFields');

exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();

	res.status(200).json({
		status: 'success',
		results: users.length,
		data: { users },
	});
});

exports.getUserByID = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) return next(new Error('User not found'));

	res.status(200).json({
		status: 'success',
		data: { user },
	});
});

exports.createUser = catchAsync(async (req, res, next) => {
	const user = await User.create(restrictFields(req.body, 'name', 'email', 'password', 'confirm'));

	res.status(201).json({
		status: 'success',
		data: { user },
	});
});

exports.updateUser = catchAsync(async (req, res, next) => {
	const data = restrictFields(req.body, 'name', 'email');
	const user = await User.findByIdAndUpdate(req.params.id, data, { new: true });

	if (!user) return next(new Error('User not found'));

	res.status(200).json({
		status: 'success',
		data: { user },
	});
});

exports.deleteUser = catchAsync(async (req, res, next) => {
	await User.findByIdAndDelete(req.params.id);

	res.status(204).json({
		status: 'success',
		data: { user: null },
	});
});
