import user, { UserModel } from '../models/user.model';
import proposal from '../models/proposal.model';
import { VoteTypes } from '../types/user.types';
import {web3Wss} from '../app';
import { Contract } from 'ethers';

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

const { TOKEN_ADDRESS } = process.env;

export default class User {
  private _walletAddress: string = '';
  private _tokenBalance: string = '';
  private _userDocument: UserModel | null = null;

  constructor(walletAddress: string) {
    this.walletAddress = walletAddress;
  }

  get walletAddress(): string {
    return this._walletAddress;
  }

  get tokenBalance(): string {
    return this._tokenBalance;
  }

  get userDocument(): UserModel | null {
    return this._userDocument;
  }

  private set walletAddress(value: string) {
    this._walletAddress = value.toLowerCase();
  }

  private set tokenBalance(value: string) {
    this._tokenBalance = value;
  }

  private set userDocument(document: UserModel) {
    this._userDocument = document;
  }

  async castVote(proposalId: string, decision: VoteTypes, nonce: string): Promise<{ voted: boolean; reason: string }> {
    const proposalDocument = await proposal.findOne({ id: proposalId, active: true });

    // Check if proposal is valid
    if (!proposalDocument) {
      return { voted: false, reason: 'Invalid proposal' };
    }

    // Check if user already voted
    if (await user.findOne({ walletAddress: this._walletAddress, 'votes.proposal': proposalId })) {
      return { voted: false, reason: 'Already voted' };
    }

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
      proposalDocument.votes.yes += 1;
      proposalDocument.votes.yesWeight = String(BigInt(proposalDocument.votes.yesWeight) + BigInt(this._tokenBalance));
    } else if (decision === 'NO') {
      proposalDocument.votes.no += 1;
      proposalDocument.votes.noWeight = String(BigInt(proposalDocument.votes.noWeight) + BigInt(this._tokenBalance));
    } else if (decision === 'ABSTAIN') {
      proposalDocument.votes.abstain += 1;
      proposalDocument.votes.abstainWeight = String(BigInt(proposalDocument.votes.abstainWeight) + BigInt(this._tokenBalance));
    }

    await proposalDocument.save();
    return { voted: true, reason: 'Voted' };
  }

  async getTokenBalance(): Promise<string> {
    const contract = new Contract(TOKEN_ADDRESS, abi, web3Wss.provider);
    try{
      return await contract.balanceOf(this._walletAddress);
    }catch(err){
      console.log(err);
      return '0';
    }

  }

  async getOrCreateUserDocument(): Promise<UserModel> {
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

  async init() {
    this.tokenBalance = await this.getTokenBalance();
    this.userDocument = await this.getOrCreateUserDocument();
  }
}
