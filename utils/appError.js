class AppError extends Error {
	/**
	 *  Custom error class for use with Express error middleware
	 *
	 *  @param {string} message - Message to send to the client
	 *  @param {number} statusCode - HTTP status code to send to the client
	 */
	constructor(message, statusCode) {
		super(message);

		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.statusCode = statusCode || 500;

		Error.captureStackTrace(this, this.constructor);
	}
}

exports.AppError = AppError;
