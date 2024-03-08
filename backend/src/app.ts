import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import {router as voteRouter} from './routes/vote.routes'; 
import {router as proposalRouter} from './routes/proposal.routes'; 
import {router as userRouter} from './routes/user.routes'; 

const app = express();

app.use(express.json());

app.use('/vote', voteRouter);

app.use('/proposal', proposalRouter);

app.use('/user', userRouter);

// For testing
export default app;