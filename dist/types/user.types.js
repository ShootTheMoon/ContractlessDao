"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVote = exports.voteTypes = void 0;
exports.voteTypes = ['YES', 'NO', 'ABSTAIN'];
const isVote = (x) => exports.voteTypes.includes(x);
exports.isVote = isVote;
//# sourceMappingURL=user.types.js.map