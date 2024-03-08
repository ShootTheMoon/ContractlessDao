"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proposal_model_1 = __importDefault(require("#models/proposal.model"));
const customError_1 = __importDefault(require("#utils/customError"));
class Proposal {
    get proposal() {
        return this._proposal;
    }
    /**
       * Get the active proposal
       * @returns {Promise<void>}
       */
    async init() {
        this._proposal = await this._getActiveProposal();
    }
    /**
     * Get one proposal and send it in the response. Only one proposal can be found at a time.
     * @returns {Promise<ProposalType>}
     */
    async _getActiveProposal() {
        const activeProposal = await proposal_model_1.default.findOne({ active: true });
        if (!activeProposal) {
            throw (0, customError_1.default)('No active proposal found', 404);
        }
        return activeProposal;
    }
}
exports.default = Proposal;
//# sourceMappingURL=proposal.service.js.map