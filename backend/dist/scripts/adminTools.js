"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompt_1 = __importDefault(require("prompt"));
const uuid_1 = require("uuid");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const proposal_model_1 = __importDefault(require("../models/proposal.model"));
const { ENV, MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_PRODUCTION, DATABASE_TEST } = process.env;
if (ENV === 'development') {
    mongoose_1.default.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_TEST}`);
}
if (ENV === 'production') {
    mongoose_1.default.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_PRODUCTION}`);
}
async function createProposal() {
    const activeProposals = await proposal_model_1.default.find({ active: true });
    for (const active of activeProposals) {
        active.active = false;
        await active.save();
    }
    // Get user input
    prompt_1.default.start();
    const schema = {
        properties: {
            inputProposal: {
                message: 'What is the proposal?',
                required: true,
            },
        },
    };
    const { inputProposal } = await prompt_1.default.get(schema);
    console.log(inputProposal);
    const prop = await proposal_model_1.default.create({
        id: (0, uuid_1.v4)(),
        proposal: inputProposal,
        active: true,
        votes: {
            yes: 0,
            yesWeight: '0',
            no: 0,
            noWeight: '0',
            abstain: 0,
            abstainWeight: '0',
        },
    });
    console.log(prop);
}
const targetFunction = process.argv[2];
if (targetFunction === 'create-proposal') {
    createProposal();
}
else {
    console.log('No function specified');
}
//# sourceMappingURL=adminTools.js.map