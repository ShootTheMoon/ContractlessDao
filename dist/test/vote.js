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
(0, mocha_1.describe)('Vote Tests', async () => {
    let provider;
    const accountList = [];
    (0, mocha_1.before)('Start fork', () => {
        // Start the eth fork
        // Start fork on port
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
        });
    });
    beforeEach('Clear Test Database Collection', () => {
        return new Promise((resolve) => {
            mongoose_1.default.connection.dropCollection('users').then(resolve);
        });
    });
    beforeEach('Create a new proposal', () => {
        return new Promise((resolve) => {
            mongoose_1.default.connection.dropCollection('proposals').then(async () => {
                const activeProposals = await proposal_model_1.default.find({ active: true });
                for (const active of activeProposals) {
                    active.active = false;
                    await active.save();
                }
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
                resolve();
            });
        });
    });
    (0, mocha_1.it)('Successfully Vote From Fresh Wallet', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = await proposal_model_1.default.findOne({ active: true });
        console.log(activeProposal);
        assert_1.default.notEqual(activeProposal, null);
        // Generate random nonce
        const nonce = (0, uuid_1.v4)();
        const vote = `${activeProposal.id}.YES.${nonce}`;
        const signedMessage = await account.signMessage(vote);
        chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote,
            walletAddress: account.address,
            voteSignature: signedMessage,
        }).end((err, res) => {
            console.log(res.body);
            assert_1.default.equal(res.body.voted, true);
        });
    });
    (0, mocha_1.it)('Revoke Second Vote From Fresh Wallet On Same Proposal With Different Nonce', async function () {
        // // Create wallet
        // const account = new ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        // // Get proposal
        // const activeProposal = await proposal.findOne({ active: true });
        // assert.notEqual(activeProposal, null);
        // // Generate random nonce
        // const nonce = uuidv4();
        // const vote1 = `${activeProposal!.id}.YES.${nonce}`;
        // const signedMessage1 = await account.signMessage(vote1);
        // const vote2 = `${activeProposal!.id}.YES.${nonce}`;
        // const signedMessage2 = await account.signMessage(vote1);
        // const res1 = await chai.request(app).post('/vote/cast').send({
        //   vote: vote1,
        //   walletAddress: account.address,
        //   voteSignature: signedMessage1,
        // });
        // assert.equal(res1.body.voted, true);
        // const res2 = await chai.request(app).post('/vote/cast').send({
        //   vote: vote2,
        //   walletAddress: account.address,
        //   voteSignature: signedMessage2,
        // });
        // assert.equal(res2.body.voted, false);
    });
});
//# sourceMappingURL=vote.js.map