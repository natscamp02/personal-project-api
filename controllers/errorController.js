/**
 * Express middleware for handling errors
 * @type {import('express').ErrorRequestHandler}
 */
module.exports = (err, req, res, next) => {
	if (process.env.NODE_ENV !== 'production') console.error(err.message, err.stack);

	res.status(err.statusCode || 500).json({
		status: err.status || 'error',
		message: err.message || 'Something went wrong. Please try again later',
	});
};
