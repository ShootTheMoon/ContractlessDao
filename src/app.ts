import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import Web3Service from './services/web3.service';
import {router as voteRouter} from './routes/vote.routes'; 
import {router as proposalRouter} from './routes/proposal.routes'; 
import {router as userRouter} from './routes/user.routes'; 
import mongoose from 'mongoose';

const {ENV, MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_PRODUCTION, DATABASE_TEST, WSS_URL, FORK, TOKEN_ADDRESS, PORT} = process.env;

export const web3Wss = new Web3Service();

if(FORK != 'test') web3Wss.init(WSS_URL, TOKEN_ADDRESS);

const app = express();

app.use(express.json());


if (ENV === 'development') {
  mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_TEST}`);
}

if (ENV === 'production') {
  mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_PRODUCTION}`);
}

app.use('/vote', voteRouter);

app.use('/proposal', proposalRouter);

app.use('/user', userRouter);

app.listen(PORT, () => {
  console.log('Server running');
});

// For testing
export default app;