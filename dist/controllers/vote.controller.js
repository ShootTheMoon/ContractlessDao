"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.post_castVote = void 0;
const ethers_1 = require("ethers");
const user_service_1 = __importDefault(require("../services/user.service"));
const nonce_service_1 = __importDefault(require("../services/nonce.service"));
const user_types_1 = require("../types/user.types");
async function post_castVote(req, res) {
    const { walletAddress, voteSignature, vote } = req.body;
    if (!walletAddress || !voteSignature || !vote)
        return res.send({ voted: false, reason: 'Missing route parameters' });
    const signingAddress = ethers_1.ethers.utils.verifyMessage(vote, voteSignature);
    // Check if signature is valid
    if (signingAddress.toLowerCase() == walletAddress.toLowerCase()) {
        const proposal = vote.split('.')[0];
        const decision = vote.split('.')[1];
        // check if decision is valid type
        if (!(0, user_types_1.isVote)(decision)) {
            return res.send({ voted: false, reason: 'Invalid vote' });
        }
        const nonce = new nonce_service_1.default(vote.split('.')[2]);
        // check if nonce is type uuid
        if (!nonce.nonceValidity()) {
            return res.send({ voted: false, reason: 'Invalid nonce' });
        }
        // check if nonce has been used before
        if (!(await nonce.uniqueNonce())) {
            return res.send({ voted: false, reason: 'Duplicate nonce' });
        }
        const user = new user_service_1.default(walletAddress);
        await user.init();
        const voted = await user.castVote(proposal, decision, nonce.nonce);
        return res.send(voted);
    }
    return res.send({ voted: false, reason: 'Invalid wallet signature' });
}
exports.post_castVote = post_castVote;
//# sourceMappingURL=vote.controller.js.map