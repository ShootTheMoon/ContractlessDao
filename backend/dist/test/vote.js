"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ganache_cli_1 = __importDefault(require("ganache-cli"));
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const mocha_1 = require("mocha");
dotenv_1.default.config();
const uuid_1 = require("uuid");
const assert_1 = __importDefault(require("assert"));
const mongoose_1 = __importDefault(require("mongoose"));
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const app_1 = __importDefault(require("../app"));
const proposalHelpers_1 = __importDefault(require("../testHelpers/proposalHelpers"));
const app_2 = require("../app");
const abi = [
    // Read-Only Functions
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    // Authenticated Functions
    'function transfer(address to, uint amount) returns (bool)',
    // Events
    'event Transfer(address indexed from, address indexed to, uint amount)',
];
const { MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_TEST, ETH_JSON_RPC_URL, USDC_ADDRESS } = process.env;
const USDC_WHALE_ACCOUNT = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503'; // Make sure this is a wallet and not a smart contract
const forkOptions = {
    fork: ETH_JSON_RPC_URL,
    ws: true,
    locked: true,
    unlocked_accounts: [USDC_WHALE_ACCOUNT]
};
const server = ganache_cli_1.default.server(forkOptions);
const port = 8546;
chai_1.default.use(chai_http_1.default);
mongoose_1.default.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_TEST}`);
async function mineBlock() {
    await axios_1.default.post(`http://localhost:${port}`, {
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: new Date().getTime()
    });
}
function promiseTimeout(delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, delay);
    });
}
async function getTokenBalance(walletAddress, provider) {
    const usdcContract = new ethers_1.ethers.Contract(USDC_ADDRESS, abi, provider); // USDC contract
    const balance = (await usdcContract.balanceOf(walletAddress)).toString();
    return balance;
}
(0, mocha_1.describe)('Vote Tests', async function () {
    let provider;
    const accountList = [];
    (0, mocha_1.before)('Start fork', function () {
        return new Promise((resolve) => {
            server.listen(port, async (err, blockchain) => {
                console.log('Forking successful on port:', port);
                app_2.web3Wss.init(`ws://localhost:${port}`);
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
    (0, mocha_1.before)('Populate Accounts With DAO Tokens', async function () {
        const signer = provider.getSigner(0); // Using the first account
        const tx = {
            to: USDC_WHALE_ACCOUNT,
            value: ethers_1.ethers.utils.parseEther('1.0'),
            gasLimit: ethers_1.ethers.utils.hexlify(21000)
        };
        const transactionResponse = await signer.sendTransaction(tx); // Send the txn
        await transactionResponse.wait(); // Wait for the transaction to be mined
        const usdcWhaleSigner = provider.getSigner(USDC_WHALE_ACCOUNT); // Get the unlocked whale signer
        const usdcContract = new ethers_1.ethers.Contract(USDC_ADDRESS, abi, usdcWhaleSigner); // USDC contract
        await usdcContract.transfer(accountList[0].address, '1000000'); // Send X tokens to account 0
    });
    beforeEach('Clear Test Database Collection', async function () {
        await mongoose_1.default.connection.dropCollection('users');
    });
    beforeEach('Clear Test Database Collection', async function () {
        await mongoose_1.default.connection.dropCollection('users');
    });
    beforeEach('Drop All Proposals', async function () {
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
        const tokenBalance = await getTokenBalance(account.address, provider);
        const votes = await activeProposal.getVotes();
        assert_1.default.equal(votes.yes, 1);
        assert_1.default.equal(votes.yesWeight, tokenBalance);
        assert_1.default.deepEqual(res.body, { voted: true, reason: 'Voted', weight: tokenBalance });
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
        const tokenBalance = await getTokenBalance(account.address, provider);
        const votes = await activeProposal.getVotes();
        assert_1.default.equal(votes.no, 1);
        assert_1.default.equal(votes.noWeight, tokenBalance);
        assert_1.default.deepEqual(res.body, { voted: true, reason: 'Voted', weight: tokenBalance });
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
        const tokenBalance = await getTokenBalance(account.address, provider);
        const votes = await activeProposal.getVotes();
        assert_1.default.equal(votes.abstain, 1);
        assert_1.default.equal(votes.abstainWeight, tokenBalance);
        assert_1.default.deepEqual(res.body, { voted: true, reason: 'Voted', weight: tokenBalance });
    });
    (0, mocha_1.it)('Successfully Cast Two Votes On Separate Proposals From Fresh Wallet', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        const tokenBalance = await getTokenBalance(account.address, provider);
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
        const votes1 = await activeProposal1.getVotes();
        assert_1.default.equal(votes1.yes, 1);
        assert_1.default.equal(votes1.yesWeight, tokenBalance);
        assert_1.default.deepEqual(res1.body, { voted: true, reason: 'Voted', weight: tokenBalance });
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
        const votes2 = await activeProposal2.getVotes();
        assert_1.default.equal(votes2.no, 1);
        assert_1.default.equal(votes2.noWeight, tokenBalance);
        assert_1.default.deepEqual(res2.body, { voted: true, reason: 'Voted', weight: tokenBalance });
    });
    (0, mocha_1.it)('Revoke Second Vote From Fresh Wallet On Same Proposal With Same Nonce', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        const tokenBalance = await getTokenBalance(account.address, provider);
        // Get proposal
        const activeProposal = new proposalHelpers_1.default;
        await activeProposal.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal.id, null);
        // Generate random nonce
        const nonce = (0, uuid_1.v4)();
        const vote1 = `${activeProposal.id}.YES.${nonce}`;
        const signedMessage1 = await account.signMessage(vote1);
        const res1 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote1,
            walletAddress: account.address,
            voteSignature: signedMessage1,
        });
        const votes1 = await activeProposal.getVotes();
        assert_1.default.equal(votes1.yes, 1);
        assert_1.default.equal(votes1.yesWeight, tokenBalance);
        assert_1.default.deepEqual(res1.body, { voted: true, reason: 'Voted', weight: tokenBalance });
        const vote2 = `${activeProposal.id}.NO.${nonce}`;
        const signedMessage2 = await account.signMessage(vote2);
        const res2 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote2,
            walletAddress: account.address,
            voteSignature: signedMessage2,
        });
        const votes2 = await activeProposal.getVotes();
        assert_1.default.equal(votes2.yes, 1);
        assert_1.default.equal(votes2.yesWeight, tokenBalance);
        assert_1.default.equal(votes2.no, 0);
        assert_1.default.equal(votes2.noWeight, '0');
        assert_1.default.deepEqual(res2.body, { voted: false, reason: 'Duplicate nonce' });
    });
    (0, mocha_1.it)('Revoke Second Vote From Fresh Wallet On Same Proposal With Different Nonce', async function () {
        // Create wallet
        const account = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        const tokenBalance = await getTokenBalance(account.address, provider);
        // Get proposal
        const activeProposal = new proposalHelpers_1.default;
        await activeProposal.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal.id, null);
        // Generate random nonce
        const nonce1 = (0, uuid_1.v4)();
        const vote1 = `${activeProposal.id}.YES.${nonce1}`;
        const signedMessage1 = await account.signMessage(vote1);
        const res1 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote1,
            walletAddress: account.address,
            voteSignature: signedMessage1,
        });
        assert_1.default.deepEqual(res1.body, { voted: true, reason: 'Voted', weight: tokenBalance });
        // Generate random nonce
        const nonce2 = (0, uuid_1.v4)();
        const vote2 = `${activeProposal.id}.YES.${nonce2}`;
        const signedMessage2 = await account.signMessage(vote2);
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
        const tokenBalance = await getTokenBalance(account.address, provider);
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
        const votes1 = await activeProposal1.getVotes();
        assert_1.default.equal(votes1.yes, 1);
        assert_1.default.equal(votes1.yesWeight, tokenBalance);
        assert_1.default.deepEqual(res1.body, { voted: true, reason: 'Voted', weight: tokenBalance });
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
        const votes2 = await activeProposal2.getVotes();
        assert_1.default.equal(votes2.yes, 0);
        assert_1.default.equal(votes2.yesWeight, '0');
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
        const vote = `${activeProposal.id}.NO.${nonce}`;
        const signedMessage = await account2.signMessage(vote);
        const res = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote,
            walletAddress: account1.address,
            voteSignature: signedMessage,
        });
        const votes = await activeProposal.getVotes();
        assert_1.default.equal(votes.no, 0);
        assert_1.default.equal(votes.noWeight, '0');
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
        const votes = await activeProposal.getVotes();
        assert_1.default.equal(votes.no, 0);
        assert_1.default.equal(votes.noWeight, '0');
        assert_1.default.deepEqual(res.body, { voted: false, reason: 'Invalid nonce' });
    });
    (0, mocha_1.it)('Update Vote Weight After Token Transfer To Unvoted Wallet', async function () {
        const TOKENS_TO_SEND = '5000';
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
        const tokenBalance1 = await getTokenBalance(account.address, provider);
        const votes1 = await activeProposal.getVotes();
        assert_1.default.equal(votes1.yes, 1);
        assert_1.default.equal(votes1.yesWeight, tokenBalance1);
        assert_1.default.deepEqual(res.body, { voted: true, reason: 'Voted', weight: tokenBalance1 });
        const usdcContract = new ethers_1.ethers.Contract(USDC_ADDRESS, abi, provider); // USDC contract
        const accountSigner = usdcContract.connect(account);
        await accountSigner.transfer(accountList[1].address, TOKENS_TO_SEND); // Send X tokens to account 2
        const tokenBalance2 = await getTokenBalance(account.address, provider);
        await promiseTimeout(3000);
        const votes2 = await activeProposal.getVotes();
        assert_1.default.equal(votes2.yes, 1);
        assert_1.default.equal(votes2.yesWeight, tokenBalance2);
    });
    (0, mocha_1.it)('Update Vote Weight After Token Transfer To Voted Wallet', async function () {
        const TOKENS_TO_SEND = '3000';
        // Create wallet
        const account1 = new ethers_1.ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);
        const account2 = new ethers_1.ethers.Wallet(accountList[1].secretKey.toString('hex'), provider);
        // Get proposal
        const activeProposal = new proposalHelpers_1.default;
        await activeProposal.init();
        // Check that proposal exists
        assert_1.default.notEqual(activeProposal.id, null);
        // Generate random nonce
        const nonce1 = (0, uuid_1.v4)();
        const vote1 = `${activeProposal.id}.YES.${nonce1}`;
        const signedMessage1 = await account1.signMessage(vote1);
        const res1 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote1,
            walletAddress: account1.address,
            voteSignature: signedMessage1,
        });
        const account1TokenBalance1 = await getTokenBalance(account1.address, provider);
        const votes1 = await activeProposal.getVotes();
        assert_1.default.equal(votes1.yes, 1);
        assert_1.default.equal(votes1.yesWeight, account1TokenBalance1);
        assert_1.default.deepEqual(res1.body, { voted: true, reason: 'Voted', weight: account1TokenBalance1 });
        // Generate random nonce
        const nonce2 = (0, uuid_1.v4)();
        const vote2 = `${activeProposal.id}.NO.${nonce2}`;
        const signedMessage2 = await account2.signMessage(vote2);
        const res2 = await chai_1.default.request(app_1.default).post('/vote/cast').send({
            vote: vote2,
            walletAddress: account2.address,
            voteSignature: signedMessage2,
        });
        const account2TokenBalance1 = await getTokenBalance(account2.address, provider);
        const votes2 = await activeProposal.getVotes();
        assert_1.default.equal(votes2.no, 1);
        assert_1.default.equal(votes2.noWeight, account2TokenBalance1);
        assert_1.default.deepEqual(res2.body, { voted: true, reason: 'Voted', weight: account2TokenBalance1 });
        const usdcContract = new ethers_1.ethers.Contract(USDC_ADDRESS, abi, provider); // USDC contract
        const accountSigner = usdcContract.connect(account1);
        await accountSigner.transfer(accountList[1].address, TOKENS_TO_SEND); // Send X tokens to account 2
        const account1TokenBalance2 = await getTokenBalance(account1.address, provider);
        await promiseTimeout(3000);
        const votes3 = await activeProposal.getVotes();
        assert_1.default.equal(votes3.yes, 1);
        assert_1.default.equal(votes3.yesWeight, account1TokenBalance2);
    });
});
//# sourceMappingURL=vote.js.map