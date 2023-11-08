import { Document, Schema, model } from 'mongoose';
import { VoteTypes } from '../types/user.types';

const vote = new Schema({
  proposal: {type: String, required: true, sparse: true},
  vote: {type: String, required: true},
  weight: {type: String, required: true},
  nonce: {type: String, required: true, unique: true}
});

const user = new Schema({
  walletAddress: { type: String, required: true, unique: true },
  tokenBalance: {type: String, required: true},
  votes: [vote]
}, { collection: 'users' });

interface Vote{
    proposal: string,
    vote: VoteTypes,
    weight: string,
    nonce: string
}

interface UserModel extends Document {
  id: number
  tokenBalance: string
  votes: [Vote]
}

export { UserModel };
export default model<UserModel>('user', user);