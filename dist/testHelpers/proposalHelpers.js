"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const proposal_model_1 = __importDefault(require("../models/proposal.model"));
const uuid_1 = require("uuid");
const mongoose_1 = __importDefault(require("mongoose"));
const { MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_TEST } = process.env;
mongoose_1.default.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_TEST}`);
class ProposalHelper {
    constructor() {
        this._document = null;
        this._id = null;
    }
    async init() {
        await this.createNewProposal();
    }
    async createNewProposal() {
        this._document = await proposal_model_1.default.create({
            id: (0, uuid_1.v4)(),
            proposal: 'Test proposal',
            active: true,
            votes: {
                yes: 0,
                yesWeight: '0',
                no: 0,
                noWeight: '0',
                abstain: 0,
                abstainWeight: '0',
            },
        });
        this._id = this._document.id;
    }
    async getVotes() {
        return (await this.getDocument()).votes;
    }
    async getDocument() {
        return await proposal_model_1.default.findOne({ 'id': this._id });
    }
    get id() {
        return this._id;
    }
}
exports.default = ProposalHelper;
//# sourceMappingURL=proposalHelpers.js.map