"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_user = void 0;
const user_service_1 = __importDefault(require("#services/user.service"));
const response_1 = __importDefault(require("#utils/response"));
/**
 * Handles the GET request to retrieve a user by their ID. It checks if the userId is provided in the query parameters.
 * If not, it sends an error response. Otherwise, it attempts to fetch the user's details and send them back in the response.
 *
 * @param {express.Request} req - The request object, which should include a userId in the query parameters.
 * @param {express.Response} res - The response object used to send back the HTTP response.
 * @async
 * @returns {Promise<void>}
 */
async function get_user(req, res) {
    if (!req.query.userId) {
        res.send({ msg: 'Error, no user id provided', payload: null });
        return;
    }
    const user = new user_service_1.default(req.query.userId);
    await user.getUser();
    (0, response_1.default)(res, 200, true, 'User found', { user: user.userDocument });
}
exports.get_user = get_user;
//# sourceMappingURL=user.controller.js.map