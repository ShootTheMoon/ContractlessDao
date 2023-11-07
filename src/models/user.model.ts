import { Document, Schema, model } from 'mongoose';
import { VoteTypes } from '../types/user.types';

const vote = new Schema({
  id: {type: Number, required: true, unique: true},
  vote: {type: String, required: true},
  weight: {type: Number, required: true}
});

const user = new Schema({
  id: { type: Number, required: true, unique: true },
  tokenBalance: {type: String, required: false},
  votes: [vote]
}, { collection: 'users' });

interface Vote{
    id: number,
    vote: VoteTypes,
    weight: number
}

interface UserModel extends Document {
  id: number
  tokenBalance: string
  votes: [Vote]
}

export { UserModel };
export default model<UserModel>('user', user);