"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_active = void 0;
const response_1 = __importDefault(require("#utils/response"));
const proposal_service_1 = __importDefault(require("#services/proposal.service"));
/**
 * Get one proposal and send it in the response. Only one proposal can be found at a time.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @returns {Promise<void>}
 */
async function get_active(req, res) {
    // Check for active proposal
    const activeProposal = new proposal_service_1.default();
    // Get the active proposal
    await activeProposal.init();
    (0, response_1.default)(res, 200, true, 'Proposal found', { proposal: activeProposal.proposal });
}
exports.get_active = get_active;
//# sourceMappingURL=proposal.controller.js.map