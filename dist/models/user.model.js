"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const vote = new mongoose_1.Schema({
    proposal: { type: String, required: true, sparse: true },
    vote: { type: String, required: true },
    weight: { type: String, required: true },
    nonce: { type: String, required: true, sparse: true }
});
const user = new mongoose_1.Schema({
    walletAddress: { type: String, required: true, unique: true },
    tokenBalance: { type: String, required: true },
    votes: [vote]
}, { collection: 'users' });
exports.default = (0, mongoose_1.model)('user', user);
//# sourceMappingURL=user.model.js.map