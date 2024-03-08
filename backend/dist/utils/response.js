"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * sendResponse is a utility function for sending standardized HTTP responses.
 * It structures the response object with a modular and scalable format.
 *
 * @param {express.Response} res - The Express response object used to send the response.
 * @param {number} status - The HTTP status code for the response.
 * @param {boolean} success - A flag indicating whether the response signifies a successful operation.
 * @param {string} message - A message describing the outcome of the operation.
 * @param {object|null} data - The data to be sent in the response, if any. If there's no data, pass `null`.
 */
function sendResponse(res, status, success, message, data) {
    res.status(status).send({
        success,
        message,
        data
    });
}
exports.default = sendResponse;
//# sourceMappingURL=response.js.map