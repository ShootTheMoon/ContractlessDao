import express from 'express';
import mongoose from 'mongoose';
import { ethers } from 'ethers';

const app = express();

app.use(express.json());

app.post('/vote', async (req, res) => {

  const { walletAddress, signature, vote, nonce, proposition } = req.body;

  const signingAddress = ethers.verifyMessage(nonce, signature);

  if(signingAddress.toLowerCase() == walletAddress.toLowerCase()){

  }

});

app.listen(3000, () => {
  console.log('Server running');
});


