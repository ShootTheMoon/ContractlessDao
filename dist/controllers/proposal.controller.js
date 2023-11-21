"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_active = void 0;
const proposal_model_1 = __importDefault(require("../models/proposal.model"));
async function get_active(req, res) {
    const activeProposals = await proposal_model_1.default.find({ 'active': true });
    res.send({ msg: 'Proposal found', payload: activeProposals });
}
exports.get_active = get_active;
//# sourceMappingURL=proposal.controller.js.map