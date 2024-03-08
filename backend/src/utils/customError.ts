import CustomError from '#types/customError';

/**
 * Creates a custom error object with additional properties.
 *
 * @param {string} [message] - The error message. If undefined, defaults to a generic message.
 * @param {number} [status=500] - The HTTP status code associated with the error. Defaults to 500.
 * @param {boolean} [sendMessage=false] - Flag to indicate whether the error message should be sent in the response. Defaults to false.
 * @returns {CustomError} An error object extended with custom properties.
 */
export default function customError(message: string | undefined = undefined, status: number = 500, sendMessage: boolean = false): CustomError{
  return Object.assign(new Error(message), { status: status, sendMessage: sendMessage }) as CustomError;
}