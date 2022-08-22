const { AppError } = require('../utils/appError');

function handleDBCastError(err) {
	return new AppError(`Not a valid id`, 400);
}
function handleDBValidationError(err) {
	return new AppError(err.message, 400);
}
function handleDBDuplicateError(err) {
	return new AppError(`(field) has already been taken`, 400);
}
function handleJWTError() {
	return new AppError(`Token is invalid`, 400);
}
function handleJWTExpiredError() {
	return new AppError(`Token has already expired`, 400);
}

/**
 * Express middleware for handling errors
 * @type {import('express').ErrorRequestHandler}
 */
module.exports = (err, req, res, next) => {
	if (process.env.NODE_ENV !== 'production') console.error(err.message, err.stack);

	let error = Object.assign(err);

	if (error.name === 'CastError') error = handleDBCastError(error);
	if (error.name === 'ValidationError') error = handleDBValidationError(error);
	if (error.code === 11000) error = handleDBDuplicateError(error);

	if (error.name === 'JsonWebTokenError') error = handleJWTError();
	if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

	if (error.isOperational) {
		res.status(error.statusCode).json({
			status: error.status,
			message: error.message,
		});
	} else {
		res.status(500).json({
			status: 'error',
			message: 'Something went wrong. Please try again later',
		});
	}
};
