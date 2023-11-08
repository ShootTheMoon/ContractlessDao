import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json());

import {router as voteRouter} from './routes/vote.routes';

import mongoose from 'mongoose';

const {ENV, MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_PRODUCTION, DATABASE_TEST} = process.env;

if (ENV === 'development') {
  mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_TEST}`);
}

if (ENV === 'production') {
  mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_PRODUCTION}`);
}


app.use('/vote', voteRouter);

app.listen(3000, () => {
  console.log('Server running');
});
