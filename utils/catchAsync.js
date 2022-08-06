/**
 * Utility function for handling errors during the request process
 * @param {import(".").ExpressCallback} fn - Express route handler
 * @returns {import("express").IRouterHandler} Express route handler
 */
module.exports = (fn) => (req, res, next) => {
	fn(req, res, next).catch(next);
};
