import prompt from 'prompt';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import proposal from '../models/proposal.model';

const { ENV, MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_PRODUCTION, DATABASE_TEST } = process.env;

if (ENV === 'development') {
  mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_TEST}`);
}

if (ENV === 'production') {
  mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_PRODUCTION}`);
}

async function createProposal() {
  const activeProposals = await proposal.find({ active: true });

  for (const active of activeProposals) {
    active.active = false;
    await active.save();
  }

  // Get user input
  prompt.start();

  const schema = {
    properties: {
      inputProposal: {
        message: 'What is the proposal?',
        required: true,
      },
    },
  };

  const { inputProposal } = await prompt.get(schema);

  console.log(inputProposal);

  const prop = await proposal.create({
    id: uuidv4(),
    proposal: inputProposal,
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
  console.log(prop);
}

const targetFunction = process.argv[2];

if (targetFunction === 'create-proposal') {
  createProposal();
} else {
  console.log('No function specified');
}
