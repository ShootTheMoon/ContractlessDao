"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
exports.router = express_1.default.Router();
const proposal_controller_1 = require("../controllers/proposal.controller");
exports.router.get('/get_active', proposal_controller_1.get_active);
//# sourceMappingURL=proposal.routes.js.map