const { AppError, ValidationError } = require('../utils/appError');

function sendDevError(err, req, res) {
	console.error(err.message, err.stack);

	res.status(err.statusCode || 500).json({
		status: err.status || 'error',
		message: err.message,
		error: err,
		stack: err.stack,
	});
}
function sendProdError(err, _req, res) {
	const response = {
		status: err.isOperational ? err.status : 'error',
		error: {
			type: err.isOperational ? err.type : 'RequestError',
			message: err.isOperational ? err.message : 'Something went wrong. Please try again later',
		},
	};
	if (err instanceof ValidationError) response.error.errors = err.errors;

	res.status(err.isOperational ? err.statusCode : 500).json(response);
}

function handleDBCastError(err) {
	let message = `${err.value} is not a valid ${err.path === '_id' ? 'id' : err.path}`;

	return new AppError(message, 400);
}
function handleDBValidationError(err) {
	return new ValidationError(err);
}
function handleDBDuplicateError(err) {
	err.errors = {};

	for (field in err.keyValue) {
		if (Object.hasOwnProperty.call(err.keyValue, field)) {
			err.errors[field] = { message: `'${err.keyValue[field]}' is already taken` };
		}
	}

	return new ValidationError(err);
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
	if (process.env.NODE_ENV !== 'production') return sendDevError(err, req, res);

	let error = Object.assign(err);

	if (error.name === 'CastError') error = handleDBCastError(error);
	if (error.name === 'ValidationError') error = handleDBValidationError(error);
	if (error.code === 11000) error = handleDBDuplicateError(error);

	if (error.name === 'JsonWebTokenError') error = handleJWTError();
	if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

	sendProdError(error, req, res);
};
