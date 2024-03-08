"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.ENV == 'PRODUCTION')
    require('module-alias/register');
const app_1 = __importDefault(require("./app"));
// Initialize Database
require("#core/database");
// Initialize Web3 Service
require("#services/web3.service");
const { PORT } = process.env;
app_1.default.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map