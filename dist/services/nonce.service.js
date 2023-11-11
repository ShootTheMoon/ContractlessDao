"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
class Nonce {
    constructor(nonce) {
        this._nonce = nonce;
    }
    get nonce() {
        return this._nonce;
    }
    nonceValidity() {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(this._nonce);
    }
    async uniqueNonce() {
        const nonceFound = await user_model_1.default.findOne({ 'votes.nonce': this._nonce });
        return nonceFound == null ? true : false;
    }
}
exports.default = Nonce;
//# sourceMappingURL=nonce.service.js.map