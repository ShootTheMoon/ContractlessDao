import { ethers } from 'ethers';
import proposal from '#models/proposal.model';
import user from '#models/user.model';

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


// It might be a smart idea to move the scan for balances functionality to a dedicated worker process to avoid blocking the main thread when the number of active proposals and users grows. This would involve setting up a separate process that periodically checks for active proposals and updates user balances and proposal vote weights. The worker process could communicate with the main application through a message queue or other inter-process communication mechanism to update the database and application state based on the results of the balance scan.

const VOTE_SCAN_INTERVAL = 45000;
let lastScanned: null | Date = null;
let isScanning: boolean = false;


/**
 * Provides services for interacting with the blockchain via web3, including retrieving token balances
 * and scanning for changes in token balances for users involved in active proposals.
 */
class Web3Service {
  private _provider: ethers.providers.JsonRpcProvider | undefined;
  private _contract: ethers.Contract;

  /**
   * Initializes the Web3Service with a JSON RPC provider URL.
   * @param {string} rpcUrl - The RPC URL to connect to the Ethereum or Ethereum based network.
   */
  constructor(rpcUrl: string){
    this._provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    this._contract = new ethers.Contract(process.env.TOKEN_ADDRESS, abi, this._provider);
  }

  /**
   * Gets the current JSON RPC provider.
   * @returns {ethers.providers.JsonRpcProvider | undefined} The current provider, or undefined if not set.
   */
  get provider(): ethers.providers.JsonRpcProvider | undefined{
    return this._provider;
  }

  /**
   * Initializes the token balance scanning process. It periodically checks for active proposals and updates token balances for users who have voted.
   * This method sets up a repeating interval that checks for the need to scan and updates balances accordingly.
   */
  public init() {

    if(this._provider == undefined){
      console.error('Provider not found');
      return;
    }
    this._getTokenBalancesForActiveProposals();
    
    // Check to scan every second 
    setInterval(() => {
      // If last scanned is not null and the time since last scanned is less than the vote scan interval and is scanning, return
      if (lastScanned && (Date.now() - lastScanned.getTime()) < VOTE_SCAN_INTERVAL && isScanning) return;

      this._getTokenBalancesForActiveProposals();
      console.log('Scanning...');
    }, 1000);
  }

  /**
   * Retrieves the token balance for a specified address.
   * @param {string} address - The address to query the token balance for.
   * @returns {Promise<string>} A promise that resolves to the token balance of the specified address.
   */
  public async getTokenBalance(address: string): Promise<string> {
    return await this._contract.balanceOf(address);
  }

  /**
   * Scans all active proposals to update the token balances of users who have voted on them. This method is designed to ensure
   * that vote weights in proposals accurately reflect the current token balances of participating users. For each active proposal,
   * it identifies users who have cast votes and checks if there have been any changes to their token balances since the last scan.
   * If a change is detected, the user's balance in the database is updated, and the vote weights for the proposal are adjusted
   * accordingly. This process helps maintain the integrity of the voting process by ensuring that vote weights are always based
   * on up-to-date token balances.
   * 
   * The method operates by first setting a flag to indicate that a scan is in progress. It then queries for active proposals
   * and iterates over them. For each proposal, it fetches the users who have voted and checks their current token balances against
   * the balances stored in the database. If a user's balance has changed, the method updates the database and recalculates the
   * vote weights for the proposal based on the new balances. After all proposals have been processed, the method updates the
   * `lastScanned` timestamp to mark the completion of the scan and resets the scanning flag.
   * 
   * It's important to note that this method does not return any value but has significant side effects: it updates user token
   * balances and proposal vote weights in the database, and it modifies global state variables (`lastScanned` and `isScanning`).
   * 
   * This method is private and intended to be called internally by the `Web3Service` class, typically as part of an initialization
   * process or at regular intervals to ensure that the application's data remains consistent with the state of the blockchain.
   * 
   * @async
   * @private
   * @returns {Promise<void>} This method returns nothing but performs asynchronous operations that update the application's state
   * and database based on the current token balances of users who have voted in active proposals.
   */
  private async _getTokenBalancesForActiveProposals(): Promise<void>{

    isScanning = true;

    const activeProposals = await proposal.find({'active': true});

    // If no active proposals, return
    if(activeProposals.length < 1) return;

    // Index through active proposals
    for(const proposal of activeProposals){

      let yesWeightDelta: bigint = 0n;
      let noWeightDelta: bigint = 0n;
      let abstainWeightDelta: bigint = 0n;

      const activeUsers = await user.find({'votes.proposal': proposal.id});

      // Index through active users
      for(const user of activeUsers){
        const oldBalance = BigInt(user.tokenBalance);
        console.log(user.walletAddress, oldBalance);

        // Get the wallet balance
        const newBalance = BigInt(await this.getTokenBalance(user.walletAddress));

        // Compare old balance to new balance, return if same
        if(newBalance === oldBalance) continue;

        // Update user token balance
        user.tokenBalance = String(newBalance);
        await user.save();
        // Update the vote weights
        for(const vote of user.votes){
          if (vote.proposal == proposal.id){
            if(vote.vote === 'YES'){
              yesWeightDelta += newBalance - oldBalance;
            }
            if(vote.vote === 'NO'){
              noWeightDelta += newBalance - oldBalance;
            }
            if(vote.vote === 'ABSTAIN'){
              abstainWeightDelta += newBalance - oldBalance;
            }
          }
        }
      }

      proposal.votes.yesWeight = String(BigInt(proposal.votes.yesWeight) + yesWeightDelta);
      proposal.votes.noWeight = String(BigInt(proposal.votes.noWeight) + noWeightDelta);
      proposal.votes.abstainWeight = String(BigInt(proposal.votes.abstainWeight) + abstainWeightDelta);
      
      await proposal.save();

      // Set last scanned only after all proposals have been updated
      lastScanned = new Date();

      // Set scanning to false
      isScanning = false;
    }
  }
}

export default new Web3Service(process.env.JSON_RPC_URL) as Web3Service;