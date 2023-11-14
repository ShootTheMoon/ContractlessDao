import dotenv from 'dotenv';
dotenv.config();
import proposal from '../models/proposal.model';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { ProposalModel } from '../models/proposal.model';

const { MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_TEST } = process.env;

mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_TEST}`);

export default class ProposalHelper {
  private _document: ProposalModel | null = null;
  private _id: typeof uuidv4 | null = null;

  public async init() {
    await this.createNewProposal();
  }

  private async createNewProposal() {
    this._document = await proposal.create({
      id: uuidv4(),
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

    this._id = this._document.id;
  }

  async getVotes(): Promise<{ yes: number; yesWeight: string; no: number; noWeight: string; abstain: number; abstainWeight: string }> {
    return (await this.getDocument())!.votes;
  }

  async getDocument(): Promise<ProposalModel | null> {
    return await proposal.findOne({'id': this._id});
  }

  get id(): typeof uuidv4 | null {
    return this._id;
  }
}
