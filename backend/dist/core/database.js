"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { DATABASE_PASSWORD, DATABASE_SERVER, DATABASE_USERNAME, DATABASE } = process.env;
// Initialize database
mongoose_1.default.connect(`mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_SERVER}/${DATABASE}`);
//# sourceMappingURL=database.js.map