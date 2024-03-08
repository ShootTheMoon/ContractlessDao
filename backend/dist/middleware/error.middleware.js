"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = __importDefault(require("#utils/response"));
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
function errorHandler(err, req, res, _next) {
    (0, response_1.default)(res, err.status || 500, false, err.message && err.sendMessage ? err.message : 'Something went wrong', null);
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map