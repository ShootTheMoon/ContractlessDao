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
const proposalHelpers_1 = __importDefault(require("../testHelpers/proposalHelpers"));
const app_2 = require("../app");
const { MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_TEST, WSS_URL, TOKEN_ADDRESS } = process.env;
const forkOptions = {
    fork: WSS_URL,
    ws: true,
    locked: true, // Prevent automatic block mining
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
                app_2.web3Wss.init(`ws://localhost:${port}`, TOKEN_ADDRESS);
                provider = app_2.web3Wss.provider;
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
    beforeEach('Clear Test Database Collection', async function () {
        await mongoose_1.default.connection.dropCollection('users');
    });
    beforeEach('Create a new proposal', async function () {
        await mongoose_1.default.connection.dropCollection('proposals');
    });
    (0, mocha_1.it)('Successfully Cast One Vote YES From Fresh Wallet', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = new proposalHelpers_1.default;
        await activeProposal.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal.id, null);
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
    (0, mocha_1.it)('Successfully Cast One Vote NO From Fresh Wallet', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = new proposalHelpers_1.default;
        await activeProposal.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal.id, null);
        // Generate random nonce
        const nonce = (0, uuid_1.v4)();
        const vote = `${activeProposal.id}.NO.${nonce}`;
        const signedMessage = await account.signMessage(vote);
        const res = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote,
            walletAddress: account.address,
            voteSignature: signedMessage,
        });
        assert_1.default.deepEqual(res.body, { voted: true, reason: 'Voted' });
    });
    (0, mocha_1.it)('Successfully Cast One Vote ABSTAIN From Fresh Wallet', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = new proposalHelpers_1.default;
        await activeProposal.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal.id, null);
        // Generate random nonce
        const nonce = (0, uuid_1.v4)();
        const vote = `${activeProposal.id}.ABSTAIN.${nonce}`;
        const signedMessage = await account.signMessage(vote);
        const res = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote,
            walletAddress: account.address,
            voteSignature: signedMessage,
        });
        assert_1.default.deepEqual(res.body, { voted: true, reason: 'Voted' });
    });
    (0, mocha_1.it)('Successfully Cast Two Votes On Separate Proposals From Fresh Wallet', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal1 = new proposalHelpers_1.default;
        await activeProposal1.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal1.id, null);
        // Generate random nonce
        const nonce1 = (0, uuid_1.v4)();
        const vote1 = `${activeProposal1.id}.YES.${nonce1}`;
        const signedMessage1 = await account.signMessage(vote1);
        const res1 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote1,
            walletAddress: account.address,
            voteSignature: signedMessage1,
        });
        assert_1.default.deepEqual(res1.body, { voted: true, reason: 'Voted' });
        // Get proposal
        const activeProposal2 = new proposalHelpers_1.default;
        await activeProposal2.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal2.id, null);
        // Generate random nonce
        const nonce2 = (0, uuid_1.v4)();
        const vote2 = `${activeProposal2.id}.NO.${nonce2}`;
        const signedMessage2 = await account.signMessage(vote2);
        const res2 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote2,
            walletAddress: account.address,
            voteSignature: signedMessage2,
        });
        assert_1.default.deepEqual(res2.body, { voted: true, reason: 'Voted' });
    });
    (0, mocha_1.it)('Revoke Second Vote From Fresh Wallet On Same Proposal With Same Nonce', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = new proposalHelpers_1.default;
        await activeProposal.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal.id, null);
        // Generate random nonce
        const nonce = (0, uuid_1.v4)();
        const vote1 = `${activeProposal.id}.YES.${nonce}`;
        const signedMessage1 = await account.signMessage(vote1);
        const vote2 = `${activeProposal.id}.YES.${nonce}`;
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
        assert_1.default.deepEqual(res2.body, { voted: false, reason: 'Duplicate nonce' });
    });
    (0, mocha_1.it)('Revoke Second Vote From Fresh Wallet On Same Proposal With Different Nonce', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = new proposalHelpers_1.default;
        await activeProposal.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal.id, null);
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
        const activeProposal1 = new proposalHelpers_1.default;
        await activeProposal1.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal1.id, null);
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
        const activeProposal2 = new proposalHelpers_1.default;
        await activeProposal2.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal2.id, null);
        const vote2 = `${activeProposal2.id}.YES.${nonce}`;
        const signedMessage2 = await account.signMessage(vote2);
        const res2 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote2,
            walletAddress: account.address,
            voteSignature: signedMessage2,
        });
        assert_1.default.deepEqual(res2.body, { voted: false, reason: 'Duplicate nonce' });
    });
    (0, mocha_1.it)('Revoke Singed Vote From Wallet Other Than Provided Wallet', async function () {
        // Create wallet
        const account1 = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Create signer wallet
        const account2 = new ethers_1.ethers.Wallet(accountList[1].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = new proposalHelpers_1.default;
        await activeProposal.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal.id, null);
        // Generate random nonce
        const nonce = (0, uuid_1.v4)();
        const vote = `${activeProposal.id}.YES.${nonce}`;
        const signedMessage = await account2.signMessage(vote);
        const res = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote,
            walletAddress: account1.address,
            voteSignature: signedMessage,
        });
        assert_1.default.deepEqual(res.body, { voted: false, reason: 'Invalid wallet signature' });
    });
    (0, mocha_1.it)('Revoke Vote Invalid Decision', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = new proposalHelpers_1.default;
        await activeProposal.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal.id, null);
        // Generate random nonce
        const nonce = (0, uuid_1.v4)();
        const vote = `${activeProposal.id}.INVALID.${nonce}`;
        const signedMessage = await account.signMessage(vote);
        const res = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote,
            walletAddress: account.address,
            voteSignature: signedMessage,
        });
        assert_1.default.deepEqual(res.body, { voted: false, reason: 'Invalid vote' });
    });
    (0, mocha_1.it)('Revoke Vote Invalid Nonce', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = new proposalHelpers_1.default;
        await activeProposal.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal.id, null);
        // Generate random nonce
        const nonce = '123';
        const vote = `${activeProposal.id}.NO.${nonce}`;
        const signedMessage = await account.signMessage(vote);
        const res = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote,
            walletAddress: account.address,
            voteSignature: signedMessage,
        });
        assert_1.default.deepEqual(res.body, { voted: false, reason: 'Invalid nonce' });
    });
});
//# sourceMappingURL=vote.js.map