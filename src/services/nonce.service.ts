import user from '../models/user.model';


export default class Nonce{
  private _nonce: string;
  constructor(nonce: string){
    this._nonce = nonce;
  }

  get nonce(): string{
    return this._nonce;
  }

  nonceValidity(): boolean{
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(this._nonce);
  }

  async uniqueNonce(): Promise<boolean>{
    const nonceFound = await user.findOne({'votes.nonce': this._nonce});
    return nonceFound == null ? true : false;
  }
}