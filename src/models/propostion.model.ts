import { Document, Schema, model } from 'mongoose';
import { uuid } from 'uuidv4';

const vote = new Schema({
  yes: {type: Number, required: true},
  yesWeight: {type: Number, required: true},
  no: {type: Number, required: true},
  noWeight: {type: Number, required: true},
  abstain: {type: Number, required: true},
  abstainWeight: {type: Number, required: true},
});

const proposition = new Schema({
  id: {type: String, required: true, unique: true},
  proposition: {type: String, required: true},
  active: {type: Boolean, require: true},
  votes: vote
});


interface Vote {
    yes: number,
    yesWeight: number,
    no: number,
    noWeight: number,
    abstain: number,
    abstainWeight: number,
}


interface PropositionModel extends Document {
    id: typeof uuid,
    proposition: string,
    active: boolean,
    votes: Vote
} 

export { PropositionModel };
export default model<PropositionModel>('proposition', proposition);