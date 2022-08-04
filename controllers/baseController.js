const catchAsync = require('../utils/catchAsync');

exports.getAll = catchAsync(async (req, res, next) => {
	res.status(200).json({ status: 'success' });
});
