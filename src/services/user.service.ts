import user, {UserModel} from '../models/user.model';
import { VoteTypes } from '../types/user.types';
import ethersProvider from '../utils/web3Provider';
import { Contract } from 'ethers';

const abi = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',

  // Authenticated Functions
  'function transfer(address to, uint amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)'
];

const {TOKEN_ADDRESS} = process.env;

export default class User{
  private _walletAddress: string = '';
  private _tokenBalance: string = '';
  private _userDocument: UserModel | null = null;

  constructor(walletAddress: string){
    this.walletAddress = walletAddress;
  }

  get walletAddress(): string{
    return this._walletAddress;
  }

  get tokenBalance(): string{
    return this._tokenBalance;
  }

  get userDocument(): UserModel | null{
    return this._userDocument;
  }

  private set walletAddress(value: string){
    this._walletAddress = value;
  }

  private set tokenBalance(value: string){
    this._tokenBalance = value;
  }

  private set userDocument(document: UserModel){
    this._userDocument = document;
  }

  async castVote(proposal: string, decision: VoteTypes, nonce: string): Promise<boolean>{
    if (await user.findOne({ 'walletAddress': this._walletAddress, 'vote.proposal': proposal })) {
      return false;
    } else {
      this._userDocument!.votes.push({
        proposal: proposal,
        vote: decision,
        weight: this._tokenBalance,
        nonce: nonce
      });
      await this._userDocument!.save();
      return true;
    }
  }

  async getTokenBalance(): Promise<string>{
    const contract = new Contract(TOKEN_ADDRESS, abi, ethersProvider);
    return await contract.balanceOf(this._walletAddress);
  }

  async getOrCreateUserDocument(): Promise<UserModel>{
    // Create user if not found
    let userDoc = await user.findOne({ walletAddress: this._walletAddress.toLowerCase() });
    if (!(userDoc)){
      userDoc = await user.create({ walletAddress: this._walletAddress.toLowerCase(), tokenBalance: this._tokenBalance });
    } 
    return userDoc;
  }

  async init(){
    this.tokenBalance = await this.getTokenBalance();
    this.userDocument = await this.getOrCreateUserDocument();
  }
  
}