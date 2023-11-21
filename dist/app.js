"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3Wss = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const web3_service_1 = __importDefault(require("./services/web3.service"));
const vote_routes_1 = require("./routes/vote.routes");
const proposal_routes_1 = require("./routes/proposal.routes");
const user_routes_1 = require("./routes/user.routes");
const mongoose_1 = __importDefault(require("mongoose"));
const { ENV, MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_PRODUCTION, DATABASE_TEST, JSON_RPC_URL, FORK, PORT } = process.env;
exports.web3Wss = new web3_service_1.default();
if (FORK != 'test')
    exports.web3Wss.init(JSON_RPC_URL);
const app = (0, express_1.default)();
app.use(express_1.default.json());
if (ENV === 'development') {
    mongoose_1.default.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_TEST}`);
}
if (ENV === 'production') {
    mongoose_1.default.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_PRODUCTION}`);
}
app.use('/vote', vote_routes_1.router);
app.use('/proposal', proposal_routes_1.router);
app.use('/user', user_routes_1.router);
app.listen(PORT, () => {
    console.log('Server running');
});
// For testing
exports.default = app;
//# sourceMappingURL=app.js.map