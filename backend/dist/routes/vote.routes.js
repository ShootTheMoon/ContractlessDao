"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
exports.router = express_1.default.Router();
const vote_controller_1 = require("../controllers/vote.controller");
exports.router.post('/cast', vote_controller_1.post_castVote);
//# sourceMappingURL=vote.routes.js.map