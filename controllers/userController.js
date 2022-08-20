const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const restrictFields = require('../utils/restrictFields');
const { AppError } = require('../utils/appError');

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

	if (!user) return next(new AppError('User not found', 404));

	res.status(200).json({
		status: 'success',
		data: { user },
	});
});

exports.createUser = catchAsync(async (req, res, next) => {
	const data = restrictFields(req.body, 'name', 'email', 'password', 'confirm');
	const user = await User.create(data);

	res.status(201).json({
		status: 'success',
		data: { user },
	});
});

exports.updateUser = catchAsync(async (req, res, next) => {
	const data = restrictFields(req.body, 'name', 'email');
	const user = await User.findByIdAndUpdate(req.params.id, data, { new: true });

	if (!user) return next(new AppError('User not found', 404));

	res.status(200).json({
		status: 'success',
		data: { user },
	});
});

exports.deleteUser = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.params.id);
	if (!user) return next(new AppError('User not found', 404));

	res.status(204).json({
		status: 'success',
		data: { user: null },
	});
});
