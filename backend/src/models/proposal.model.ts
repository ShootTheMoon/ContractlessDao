import { Document, Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const votes = new Schema({
  yes: {type: Number, required: true},
  yesWeight: {type: String, required: true},
  no: {type: Number, required: true},
  noWeight: {type: String, required: true},
  abstain: {type: Number, required: true},
  abstainWeight: {type: String, required: true},
});

const proposal = new Schema({
  id: {type: String, required: true, unique: true},
  proposal: {type: String, required: true},
  active: {type: Boolean, require: true},
  votes: votes
});


interface Votes {
    yes: number,
    yesWeight: string,
    no: number,
    noWeight: string,
    abstain: number,
    abstainWeight: string,
}


interface ProposalModel extends Document {
    id: typeof uuidv4,
    proposal: string,
    active: boolean,
    votes: Votes
} 

export { ProposalModel };
export default model<ProposalModel>('proposal', proposal);