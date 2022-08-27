class AppError extends Error {
	/**
	 *  Custom error class for use with Express error middleware
	 *
	 *  @param {string} message - Message to send to the client
	 *  @param {number} statusCode - HTTP status code to send to the client
	 *  @param {string?} type - The type of error
	 */
	constructor(message, statusCode, type) {
		super(message);

		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.type = type || (`${statusCode}`.startsWith('4') ? 'RequestError' : 'ServerError');
		this.statusCode = statusCode || 500;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

class ValidationError extends AppError {
	/**
	 * Custom error class for handling validation errors
	 *
	 * @param {any} error - Validation error sent by Mongoose
	 * @param {{[key:string]:string}?} errors - Optional validation error messages
	 */
	constructor(err, errors = {}) {
		super('Some fields are invalid', 400, 'ValidationError');

		this.errors = errors;

		if (err?.errors)
			for (const field in err.errors) {
				if (Object.hasOwnProperty.call(err.errors, field)) {
					this.errors[field] = err.errors[field].message;
				}
			}
	}
}

module.exports = { AppError, ValidationError };
