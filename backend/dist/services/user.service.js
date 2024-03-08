"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("#models/user.model"));
const web3_service_1 = __importDefault(require("#services/web3.service"));
const customError_1 = __importDefault(require("#utils/customError"));
const proposal_service_1 = __importDefault(require("#services/proposal.service"));
const user_types_1 = require("#types/user.types");
/**
 * Represents a user within the voting system, encapsulating their wallet address, token balance, and voting actions.
 */
class User {
    /**
     * Initializes a new instance of the User class.
     * @param {string} walletAddress - The wallet address of the user.
     */
    constructor(walletAddress) {
        this._walletAddress = '';
        this._tokenBalance = '';
        this._userDocument = null;
        this._walletAddress = walletAddress;
    }
    /**
     * Gets the wallet address of the user.
     * @returns {string} The user's wallet address.
     */
    get walletAddress() {
        return this._walletAddress;
    }
    /**
     * Gets the token balance of the user.
     * @returns {string} The user's current token balance.
     */
    get tokenBalance() {
        return this._tokenBalance;
    }
    /**
     * Gets the user document associated with this user instance.
     * @returns {UserModel | null} The user's document from the database, or null if not set.
     */
    get userDocument() {
        return this._userDocument;
    }
    /**
     * Casts a vote on a proposal on behalf of the user.
     * @param {string} proposalId - The ID of the proposal being voted on.
     * @param {VoteTypes} decision - The user's vote decision (YES, NO, ABSTAIN).
     * @param {string} nonce - A unique nonce for the vote to prevent double voting.
     * @throws {customError} Throws an error if the vote decision is invalid, the nonce is invalid or duplicated, or if the user has already voted.
     * @returns {Promise<{voted: boolean; reason: string} | {decision: string; weight: string}>} The outcome of the voting action.
     */
    async castVote(proposalId, decision, nonce) {
        // Check if decision is valid type
        if (!(0, user_types_1.isVote)(decision))
            throw (0, customError_1.default)('Invalid vote', 400, true);
        // This regex just checks if the nonce is a valid UUID, might be a smart idea to move this to middleware?
        const validNonce = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(nonce);
        // Check if nonce is valid
        if (!validNonce) {
            throw (0, customError_1.default)('Invalid nonce', 401, true);
        }
        const nonceFound = await user_model_1.default.findOne({ 'votes.nonce': nonce });
        // Check if nonce is already used
        if (nonceFound) {
            throw (0, customError_1.default)('Duplicate nonce', 401, true);
        }
        const proposalInstance = new proposal_service_1.default();
        await proposalInstance.init();
        const proposal = proposalInstance.proposal;
        // Check if user already voted
        if (await user_model_1.default.findOne({ walletAddress: this._walletAddress, 'votes.proposal': proposalId }))
            throw (0, customError_1.default)('User already voted', 400, true);
        // Log vote for user
        this._userDocument.votes.push({
            proposal: proposalId,
            vote: decision,
            weight: this._tokenBalance,
            nonce: nonce,
        });
        await this._userDocument.save();
        // Log vote for proposal
        if (decision === 'YES') {
            proposal.votes.yes += 1;
            proposal.votes.yesWeight = String(BigInt(proposal.votes.yesWeight) + BigInt(this._tokenBalance));
        }
        else if (decision === 'NO') {
            proposal.votes.no += 1;
            proposal.votes.noWeight = String(BigInt(proposal.votes.noWeight) + BigInt(this._tokenBalance));
        }
        else if (decision === 'ABSTAIN') {
            proposal.votes.abstain += 1;
            proposal.votes.abstainWeight = String(BigInt(proposal.votes.abstainWeight) + BigInt(this._tokenBalance));
        }
        await proposal.save();
        return { decision: decision, weight: this._tokenBalance };
    }
    /**
     * Fetches the user document from the database.
     * @throws {customError} Throws an error if the user is not found.
     * @returns {Promise<UserModel>} The user's document from the database.
     */
    async getUser() {
        // Create user if not found
        const userDoc = await user_model_1.default.findOne({ walletAddress: this._walletAddress.toLowerCase() });
        if (!userDoc) {
            throw (0, customError_1.default)('User not found', 404);
        }
        return userDoc;
    }
    /**
     * Retrieves the user's document from the database or creates a new document if it does not exist.
     * @private
     * @returns {Promise<UserModel>} The user's document from the database.
     */
    async _getOrCreateUser() {
        // Create user if not found
        let userDoc = await user_model_1.default.findOne({ walletAddress: this._walletAddress.toLowerCase() });
        if (!userDoc) {
            userDoc = await user_model_1.default.create({ walletAddress: this._walletAddress.toLowerCase(), tokenBalance: this._tokenBalance });
        }
        else {
            userDoc.tokenBalance = this._tokenBalance;
            await userDoc.save();
        }
        return userDoc;
    }
    /**
     * Initializes the user for voting by setting their token balance and retrieving or creating their user document.
     * @returns {Promise<void>} Completes when the user is ready for voting.
     */
    async initForVoting() {
        this._tokenBalance = await web3_service_1.default.getTokenBalance(this._walletAddress);
        this._userDocument = await this._getOrCreateUser();
    }
}
exports.default = User;
//# sourceMappingURL=user.service.js.map