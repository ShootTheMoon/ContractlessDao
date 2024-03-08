"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const votes = new mongoose_1.Schema({
    yes: { type: Number, required: true },
    yesWeight: { type: String, required: true },
    no: { type: Number, required: true },
    noWeight: { type: String, required: true },
    abstain: { type: Number, required: true },
    abstainWeight: { type: String, required: true },
});
const proposal = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    proposal: { type: String, required: true },
    active: { type: Boolean, require: true },
    votes: votes
});
exports.default = (0, mongoose_1.model)('proposal', proposal);
//# sourceMappingURL=proposal.model.js.map