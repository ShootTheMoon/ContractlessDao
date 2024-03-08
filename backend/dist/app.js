"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const vote_routes_1 = require("./routes/vote.routes");
const proposal_routes_1 = require("./routes/proposal.routes");
const user_routes_1 = require("./routes/user.routes");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/vote', vote_routes_1.router);
app.use('/proposal', proposal_routes_1.router);
app.use('/user', user_routes_1.router);
// For testing
exports.default = app;
//# sourceMappingURL=app.js.map