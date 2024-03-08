"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a custom error object with additional properties.
 *
 * @param {string} [message] - The error message. If undefined, defaults to a generic message.
 * @param {number} [status=500] - The HTTP status code associated with the error. Defaults to 500.
 * @param {boolean} [sendMessage=false] - Flag to indicate whether the error message should be sent in the response. Defaults to false.
 * @returns {CustomError} An error object extended with custom properties.
 */
function customError(message = undefined, status = 500, sendMessage = false) {
    return Object.assign(new Error(message), { status: status, sendMessage: sendMessage });
}
exports.default = customError;
//# sourceMappingURL=customError.js.map