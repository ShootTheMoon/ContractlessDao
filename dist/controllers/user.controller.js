"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_user = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
async function get_user(req, res) {
    if (!req.query.userId)
        return res.send({ msg: 'Error, no user id provided', payload: null });
    const foundUser = await user_model_1.default.findOne({ 'walletAddress': req.query.userId.toLowerCase() });
    if (!foundUser)
        return res.send({ msg: 'No user found', payload: null });
    res.send({ msg: 'User found', payload: foundUser });
}
exports.get_user = get_user;
//# sourceMappingURL=user.controller.js.map