"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const proposal_model_1 = __importDefault(require("../models/proposal.model"));
const app_1 = require("../app");
const ethers_1 = require("ethers");
const abi = [
    // Read-Only Functions
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    // Authenticated Functions
    'function transfer(address to, uint amount) returns (bool)',
    // Events
    'event Transfer(address indexed from, address indexed to, uint amount)',
];
const { TOKEN_ADDRESS } = process.env;
class User {
    constructor(walletAddress) {
        this._walletAddress = '';
        this._tokenBalance = '';
        this._userDocument = null;
        this.walletAddress = walletAddress;
    }
    get walletAddress() {
        return this._walletAddress;
    }
    get tokenBalance() {
        return this._tokenBalance;
    }
    get userDocument() {
        return this._userDocument;
    }
    set walletAddress(value) {
        this._walletAddress = value.toLowerCase();
    }
    set tokenBalance(value) {
        this._tokenBalance = value;
    }
    set userDocument(document) {
        this._userDocument = document;
    }
    async castVote(proposalId, decision, nonce) {
        const proposalDocument = await proposal_model_1.default.findOne({ id: proposalId, active: true });
        // Check if proposal is valid
        if (!proposalDocument) {
            return { voted: false, reason: 'Invalid proposal' };
        }
        // Check if user already voted
        if (await user_model_1.default.findOne({ walletAddress: this._walletAddress, 'votes.proposal': proposalId })) {
            return { voted: false, reason: 'Already voted' };
        }
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
            proposalDocument.votes.yes += 1;
            proposalDocument.votes.yesWeight = String(BigInt(proposalDocument.votes.yesWeight) + BigInt(this._tokenBalance));
        }
        else if (decision === 'NO') {
            proposalDocument.votes.no += 1;
            proposalDocument.votes.noWeight = String(BigInt(proposalDocument.votes.noWeight) + BigInt(this._tokenBalance));
        }
        else if (decision === 'ABSTAIN') {
            proposalDocument.votes.abstain += 1;
            proposalDocument.votes.abstainWeight = String(BigInt(proposalDocument.votes.abstainWeight) + BigInt(this._tokenBalance));
        }
        await proposalDocument.save();
        return { voted: true, reason: 'Voted', weight: this._tokenBalance };
    }
    async getTokenBalance() {
        const contract = new ethers_1.Contract(TOKEN_ADDRESS, abi, app_1.web3Wss.provider);
        return (await contract.balanceOf(this._walletAddress)).toString();
    }
    async getOrCreateUserDocument() {
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
    async init() {
        this.tokenBalance = await this.getTokenBalance();
        this.userDocument = await this.getOrCreateUserDocument();
    }
}
exports.default = User;
//# sourceMappingURL=user.service.js.map