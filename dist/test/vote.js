"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ganache_cli_1 = __importDefault(require("ganache-cli"));
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const mocha_1 = require("mocha");
dotenv_1.default.config();
const proposal_model_1 = __importDefault(require("../models/proposal.model"));
const uuid_1 = require("uuid");
const assert_1 = __importDefault(require("assert"));
const mongoose_1 = __importDefault(require("mongoose"));
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const app_1 = __importDefault(require("../app"));
const { MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_TEST, JSON_RPC_URL } = process.env;
const forkOptions = {
    fork: JSON_RPC_URL,
    network_id: 1,
};
const server = ganache_cli_1.default.server(forkOptions);
const port = 8546;
chai_1.default.use(chai_http_1.default);
mongoose_1.default.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_TEST}`);
(0, mocha_1.describe)('Vote Tests', async function () {
    let provider;
    const accountList = [];
    (0, mocha_1.before)('Start fork', function () {
        return new Promise((resolve) => {
            server.listen(port, async (err, blockchain) => {
                console.log('Forking successful on port:', port);
                provider = new ethers_1.ethers.JsonRpcProvider(`http://localhost:${port}`);
                // Retrieve accounts
                const accounts = blockchain ? blockchain.accounts : null;
                if (accounts) {
                    Object.keys(accounts).forEach((account) => {
                        accountList.push(accounts[account]);
                    });
                }
                resolve();
            });
        });
    });
    beforeEach('Clear Test Database Collection', function () {
        return new Promise((resolve) => {
            mongoose_1.default.connection.dropCollection('users').then(resolve);
        });
    });
    beforeEach('Create a new proposal', async function () {
        await mongoose_1.default.connection.dropCollection('proposals');
        await proposal_model_1.default.create({
            id: (0, uuid_1.v4)(),
            proposal: 'Test proposal',
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
    });
    (0, mocha_1.it)('Successfully Vote From Fresh Wallet', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = await proposal_model_1.default.findOne({ active: true });
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal, null);
        // Generate random nonce
        const nonce = (0, uuid_1.v4)();
        const vote = `${activeProposal.id}.YES.${nonce}`;
        const signedMessage = await account.signMessage(vote);
        const res = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote,
            walletAddress: account.address,
            voteSignature: signedMessage,
        });
        assert_1.default.deepEqual(res.body, { voted: true, reason: 'Voted' });
    });
    (0, mocha_1.it)('Revoke Second Vote From Fresh Wallet On Same Proposal With Different Nonce', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = await proposal_model_1.default.findOne({ active: true });
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal, null);
        // Generate random nonce
        const nonce1 = (0, uuid_1.v4)();
        const vote1 = `${activeProposal.id}.YES.${nonce1}`;
        const signedMessage1 = await account.signMessage(vote1);
        // Generate random nonce
        const nonce2 = (0, uuid_1.v4)();
        const vote2 = `${activeProposal.id}.YES.${nonce2}`;
        const signedMessage2 = await account.signMessage(vote2);
        const res1 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote1,
            walletAddress: account.address,
            voteSignature: signedMessage1,
        });
        assert_1.default.deepEqual(res1.body, { voted: true, reason: 'Voted' });
        const res2 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote2,
            walletAddress: account.address,
            voteSignature: signedMessage2,
        });
        assert_1.default.deepEqual(res2.body, { voted: false, reason: 'Already voted' });
    });
    (0, mocha_1.it)('Revoke Second Vote From Fresh Wallet On Different Proposal With Same Nonce', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal1 = await proposal_model_1.default.findOne({ active: true });
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal1, null);
        // Generate random nonce
        const nonce = (0, uuid_1.v4)();
        const vote1 = `${activeProposal1.id}.YES.${nonce}`;
        const signedMessage1 = await account.signMessage(vote1);
        const res1 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote1,
            walletAddress: account.address,
            voteSignature: signedMessage1,
        });
        assert_1.default.deepEqual(res1.body, { voted: true, reason: 'Voted' });
        await mongoose_1.default.connection.dropCollection('proposals');
        await proposal_model_1.default.create({
            id: (0, uuid_1.v4)(),
            proposal: 'Test proposal',
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
        // Get proposal
        const activeProposal2 = await proposal_model_1.default.findOne({ active: true });
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal2, null);
        const vote2 = `${activeProposal1.id}.YES.${nonce}`;
        const signedMessage2 = await account.signMessage(vote2);
        const res2 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote2,
            walletAddress: account.address,
            voteSignature: signedMessage2,
        });
        assert_1.default.deepEqual(res2.body, { voted: false, reason: 'Duplicate nonce' });
    });
});
//# sourceMappingURL=vote.js.map