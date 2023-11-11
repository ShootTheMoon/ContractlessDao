"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const { JSON_RPC_URL } = process.env;
const ethersProvider = new ethers_1.ethers.JsonRpcProvider(JSON_RPC_URL);
exports.default = ethersProvider;
//# sourceMappingURL=web3Provider.js.map