import express from 'express';
import CustomError from '#types/customError';
import sendResponse from '#utils/response';

/**
 * errorHandler is a middleware function for handling errors in Express applications. 
 * It uses the `sendResponse` utility to send a standardized error response.
 * The function checks if the error is a `CustomError` and sends an appropriate HTTP response.
 *
 * @param {CustomError} err - The error object, which is expected to be an instance of `CustomError`.
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 * @param {express.NextFunction} _next - Express next function. Not used in this function.
 */
export function errorHandler(err: CustomError, req: express.Request, res: express.Response, _next: express.NextFunction) {
  sendResponse(res, err.status || 500, false, err.message && err.sendMessage ? err.message : 'Something went wrong', null);
}