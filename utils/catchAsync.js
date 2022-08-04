const { Request, Response, NextFunction, IRouterHandler } = require('express');

/**
 * @callback ExpressCallback
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */

/**
 * Utility function for handling errors during the request process
 * @param {ExpressCallback} fn - Express route handler
 * @returns {IRouterHandler} Express route handler
 */
module.exports = (fn) => (req, res, next) => {
	fn(req, res, next).catch(next);
};
