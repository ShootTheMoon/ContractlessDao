"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignature = void 0;
const ethers_1 = require("ethers");
const customError_1 = __importDefault(require("#utils/customError"));
async function verifySignature(req, res, next) {
    const { walletAddress, voteSignature, vote } = req.body;
    // If wallet address is not provided
    if (!walletAddress)
        next((0, customError_1.default)('Wallet address not provided', 400, true));
    // If wallet address is invalid
    if (!ethers_1.ethers.utils.isAddress(walletAddress))
        next((0, customError_1.default)('Invalid wallet address', 400, true));
    // If vote signature is not provided
    if (!voteSignature)
        next((0, customError_1.default)('Vote signature not provided', 400, true));
    // If vote is not provided
    if (!vote)
        next((0, customError_1.default)('Vote not provided', 400, true));
    // Get the signing address
    const signingAddress = ethers_1.ethers.utils.verifyMessage(vote, voteSignature);
    // Check if signature is valid
    if (signingAddress.toLowerCase() != walletAddress.toLowerCase())
        next((0, customError_1.default)('Invalid wallet signature', 401, true));
    const proposal = vote.split('.')[0];
    const decision = vote.split('.')[1];
    const nonce = vote.split('.')[2];
    req.body.proposal = proposal;
    req.body.decision = decision;
    req.body.nonce = nonce;
    next();
}
exports.verifySignature = verifySignature;
//# sourceMappingURL=authentication.middleware.js.map