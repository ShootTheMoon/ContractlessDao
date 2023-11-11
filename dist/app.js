"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const vote_routes_1 = require("./routes/vote.routes");
const mongoose_1 = __importDefault(require("mongoose"));
const { ENV, MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_PRODUCTION, DATABASE_TEST } = process.env;
if (ENV === 'development') {
    mongoose_1.default.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_TEST}`);
}
if (ENV === 'production') {
    mongoose_1.default.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_PRODUCTION}`);
}
app.use('/vote', vote_routes_1.router);
app.listen(3000, () => {
    console.log('Server running');
});
// For testing
exports.default = app;
//# sourceMappingURL=app.js.map