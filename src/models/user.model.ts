import { Document, Schema, model } from 'mongoose';
import { VoteTypes } from '../types/user.types';

const proposition = new Schema({
  id: {type: Number, required: true, unique: true},
  vote: {type: String, required: true}
});

const user = new Schema({
  id: { type: Number, required: true, unique: true },
  tokenBalance: {type: String, required: false},
  votes: [proposition]
}, { collection: 'users' });

interface Proposition{
    id: number,
    vote: VoteTypes
}

interface UserModel extends Document {
  id: number
  tokenBalance: string
  votes: [Proposition]
}

export { UserModel };
export default model<UserModel>('user', user);