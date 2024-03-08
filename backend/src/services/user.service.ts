import user, { UserModel } from '#models/user.model';
import { VoteTypes } from '#types/user.types';
import Web3Service from '#services/web3.service';
import customError from '#utils/customError';
import Proposal from '#services/proposal.service';
import { isVote } from '#types/user.types';

/**
 * Represents a user within the voting system, encapsulating their wallet address, token balance, and voting actions.
 */
export default class User {
  private _walletAddress: string = '';
  private _tokenBalance: string = '';
  private _userDocument: UserModel | null = null;

  /**
   * Initializes a new instance of the User class.
   * @param {string} walletAddress - The wallet address of the user.
   */
  constructor(walletAddress: string) {
    this._walletAddress = walletAddress;
  }

  /**
   * Gets the wallet address of the user.
   * @returns {string} The user's wallet address.
   */
  get walletAddress(): string {
    return this._walletAddress;
  }

  /**
   * Gets the token balance of the user.
   * @returns {string} The user's current token balance.
   */
  get tokenBalance(): string {
    return this._tokenBalance;
  }

  /**
   * Gets the user document associated with this user instance.
   * @returns {UserModel | null} The user's document from the database, or null if not set.
   */
  get userDocument(): UserModel | null {
    return this._userDocument;
  }

  /**
   * Casts a vote on a proposal on behalf of the user.
   * @param {string} proposalId - The ID of the proposal being voted on.
   * @param {VoteTypes} decision - The user's vote decision (YES, NO, ABSTAIN).
   * @param {string} nonce - A unique nonce for the vote to prevent double voting.
   * @throws {customError} Throws an error if the vote decision is invalid, the nonce is invalid or duplicated, or if the user has already voted.
   * @returns {Promise<{voted: boolean; reason: string} | {decision: string; weight: string}>} The outcome of the voting action.
   */
  async castVote(proposalId: string, decision: VoteTypes, nonce: string): Promise<{ voted: boolean; reason: string } | { decision: string; weight: string } > {

    // Check if decision is valid type
    if(!isVote(decision)) throw customError('Invalid vote', 400, true);

    // This regex just checks if the nonce is a valid UUID, might be a smart idea to move this to middleware?
    const validNonce =  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(nonce);

    // Check if nonce is valid
    if(!validNonce){
      throw customError('Invalid nonce', 401, true);
    }
    
    const nonceFound = await user.findOne({'votes.nonce': nonce});

    // Check if nonce is already used
    if(nonceFound){
      throw customError('Duplicate nonce', 401, true);
    }

    const proposalInstance = new Proposal();

    await proposalInstance.init();

    const proposal = proposalInstance.proposal;

    // Check if user already voted
    if (await user.findOne({ walletAddress: this._walletAddress, 'votes.proposal': proposalId })) throw customError('User already voted', 400, true);

    // Log vote for user
    this._userDocument!.votes.push({
      proposal: proposalId,
      vote: decision,
      weight: this._tokenBalance,
      nonce: nonce,
    });

    await this._userDocument!.save();

    // Log vote for proposal
    if (decision === 'YES') {
      proposal.votes.yes += 1;
      proposal.votes.yesWeight = String(BigInt(proposal.votes.yesWeight) + BigInt(this._tokenBalance));
    } else if (decision === 'NO') {
      proposal.votes.no += 1;
      proposal.votes.noWeight = String(BigInt(proposal.votes.noWeight) + BigInt(this._tokenBalance));
    } else if (decision === 'ABSTAIN') {
      proposal.votes.abstain += 1;
      proposal.votes.abstainWeight = String(BigInt(proposal.votes.abstainWeight) + BigInt(this._tokenBalance));
    }

    await proposal.save();
    return { decision: decision, weight: this._tokenBalance};
  }

  /**
   * Fetches the user document from the database.
   * @throws {customError} Throws an error if the user is not found.
   * @returns {Promise<UserModel>} The user's document from the database.
   */
  public async getUser(): Promise<UserModel>{
    // Create user if not found
    const userDoc = await user.findOne({ walletAddress: this._walletAddress.toLowerCase() });
    if (!userDoc) {
      throw customError('User not found', 404);
    }
    return userDoc;
  }

  /**
   * Retrieves the user's document from the database or creates a new document if it does not exist.
   * @private
   * @returns {Promise<UserModel>} The user's document from the database.
   */
  private async _getOrCreateUser(): Promise<UserModel> {
    // Create user if not found
    let userDoc = await user.findOne({ walletAddress: this._walletAddress.toLowerCase() });
    if (!userDoc) {
      userDoc = await user.create({ walletAddress: this._walletAddress.toLowerCase(), tokenBalance: this._tokenBalance });
    }else{
      userDoc.tokenBalance = this._tokenBalance;
      await userDoc.save();
    }
    return userDoc;
  }

  /**
   * Initializes the user for voting by setting their token balance and retrieving or creating their user document.
   * @returns {Promise<void>} Completes when the user is ready for voting.
   */
  public async initForVoting(): Promise<void> {
    this._tokenBalance = await Web3Service.getTokenBalance(this._walletAddress);
    this._userDocument = await this._getOrCreateUser();
  }
}
