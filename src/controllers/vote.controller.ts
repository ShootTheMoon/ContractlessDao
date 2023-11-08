import { ethers } from 'ethers';
import express from 'express';
import user from '../models/user.model';

export async function post_castVote(req: express.Request, res: express.Response) {
  const { walletAddress, voteSignature, vote } = req.body;

  const signingAddress = ethers.verifyMessage(vote, voteSignature);

  if (signingAddress.toLowerCase() == walletAddress.toLowerCase()) {
    const proposal = vote.split('.')[0];
    const decision = vote.split('.')[1];
    const nonce = vote.split('.')[2];

    // Create user if not found
    let userDoc = await user.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!(userDoc)){
      userDoc = await user.create({ walletAddress: walletAddress.toLowerCase(), tokenBalance: '0' });
    } 

    if (await user.findOne({ 'walletAddress': walletAddress, 'vote.proposal': proposal })) {
      res.send('Already voted my dude');
      return;
    } else {
      userDoc.votes.push({
        proposal: proposal,
        vote: decision,
        weight: userDoc.tokenBalance,
        nonce: nonce
      });
      await userDoc.save();
      res.send('Vote has been cast');
      return;
    }

  }
  res.send('you trying to hack my nigga??');
}
