"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const proposal_model_1 = __importDefault(require("../models/proposal.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
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
const KEEP_ALIVE_CHECK_INTERVAL = 7500;
const EXPECTED_PONG_BACK = 15000;
class Web3Service {
    constructor() {
        this._keepAliveInterval = undefined;
        this._pingTimeout = undefined;
    }
    get provider() {
        return this._provider;
    }
    init(wssUrl, tokenAddress) {
        this._wssUrl = wssUrl;
        this._tokenAddress = tokenAddress;
        this._provider = new ethers_1.ethers.providers.WebSocketProvider(this._wssUrl);
        if (this._provider == undefined) {
            console.error('Provider not found');
            return;
        }
        this._provider._websocket.on('open', () => {
            this._keepAliveInterval = setInterval(() => {
                this._provider._websocket.ping();
                // Use `WebSocket#terminate()`, which immediately destroys the connection,
                // instead of `WebSocket#close()`, which waits for the close timer.
                // Delay should be equal to the interval at which your server
                // sends out pings plus a conservative assumption of the latency.
                this._pingTimeout = setTimeout(() => {
                    this._provider._websocket.terminate();
                }, EXPECTED_PONG_BACK);
            }, KEEP_ALIVE_CHECK_INTERVAL);
            // TODO: handle contract listeners setup + indexing
            this._provider.on('block', (block) => {
                console.log('New block', block);
                this._getTokenBalancesForActiveProposals();
            });
        });
        this._provider._websocket.on('close', () => {
            console.error('The websocket connection was closed');
            clearInterval(this._keepAliveInterval);
            clearTimeout(this._pingTimeout);
            this.init(this._wssUrl, this._tokenAddress);
        });
        this._provider._websocket.on('pong', () => {
            clearInterval(this._pingTimeout);
        });
    }
    async _getTokenBalancesForActiveProposals() {
        const activeProposals = await proposal_model_1.default.find({ 'active': true });
        if (activeProposals.length < 1)
            return;
        // Loop through active proposals
        for (const proposal of activeProposals) {
            let yesWeightDelta = 0n;
            let noWeightDelta = 0n;
            let abstainWeightDelta = 0n;
            const activeUsers = await user_model_1.default.find({ 'votes.proposal': proposal.id });
            // Loop through active users
            for (const user of activeUsers) {
                const oldBalance = BigInt(user.tokenBalance);
                const contract = new ethers_1.ethers.Contract(process.env.TOKEN_ADDRESS, abi, this.provider);
                const newBalance = BigInt((await contract.balanceOf(user.walletAddress)).toString());
                // Compare old balance to new balance, return if same
                if (newBalance === oldBalance)
                    return;
                // Update user token balance
                user.tokenBalance = String(newBalance);
                await user.save();
                // Update the vote weights
                for (const vote of user.votes) {
                    if (vote.proposal == proposal.id) {
                        if (vote.vote === 'YES') {
                            yesWeightDelta += newBalance - oldBalance;
                        }
                        if (vote.vote === 'NO') {
                            noWeightDelta += newBalance - oldBalance;
                        }
                        if (vote.vote === 'ABSTAIN') {
                            abstainWeightDelta += newBalance - oldBalance;
                        }
                    }
                }
            }
            proposal.votes.yesWeight = String(BigInt(proposal.votes.yesWeight) + yesWeightDelta);
            proposal.votes.noWeight = String(BigInt(proposal.votes.noWeight) + noWeightDelta);
            proposal.votes.abstainWeight = String(BigInt(proposal.votes.abstainWeight) + abstainWeightDelta);
            await proposal.save();
        }
    }
}
exports.default = Web3Service;
//# sourceMappingURL=web3.service.js.map