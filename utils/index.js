const { Request, Response, NextFunction } = require('express');

/**
 * @callback ExpressCallback
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
