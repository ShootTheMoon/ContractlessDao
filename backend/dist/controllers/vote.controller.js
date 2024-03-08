"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.post_castVote = void 0;
const user_service_1 = __importDefault(require("#services/user.service"));
const response_1 = __importDefault(require("#utils/response"));
/**
 * Handles the POST request for casting a vote on a proposal. It extracts the wallet address, nonce, decision,
 * and proposal ID from the request body. Then, it initializes a User instance for the given wallet address,
 * prepares it for voting by setting up the necessary user details, and finally casts a vote on the specified proposal
 * with the provided decision and nonce. If successful, it responds with a 201 status code and details of the vote cast.
 *
 * @param {express.Request} req - The request object, containing the walletAddress, nonce, decision, and proposal
 * in the body.
 * @param {express.Response} res - The response object used to send back the HTTP response.
 * @async
 * @returns {Promise<void>}
 */
async function post_castVote(req, res) {
    const { walletAddress, nonce, decision, proposal } = req.body;
    const user = new user_service_1.default(walletAddress);
    await user.initForVoting();
    const vote = await user.castVote(proposal, decision, nonce);
    (0, response_1.default)(res, 201, true, 'Voted', vote);
}
exports.post_castVote = post_castVote;
//# sourceMappingURL=vote.controller.js.map