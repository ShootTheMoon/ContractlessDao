import { ethers } from 'ethers';
import express from 'express';
import User from '../services/user.service';
import Nonce from '../services/nonce.service';
import { isVote } from '../types/user.types';

export async function post_castVote(req: express.Request, res: express.Response) {
  const { walletAddress, voteSignature, vote } = req.body;

  const signingAddress = ethers.verifyMessage(vote, voteSignature);

  // Check if signature is valid
  if (signingAddress.toLowerCase() == walletAddress.toLowerCase()) {
    const proposal = vote.split('.')[0];
    const decision = vote.split('.')[1];

    // check if decision is valid type
    if(!isVote(decision)){
      return res.send({err: 'invalid vote'});
    }

    const nonce = new Nonce(vote.split('.')[2]);

    // check if nonce is type uuid
    if(!nonce.nonceValidity()){
      return res.send({err: 'bad nonce format'});
    }

    // check if nonce has been used before
    if(!(await nonce.uniqueNonce())){
      return res.send({err: 'duplicate nonce'});
    }
    
    const user = new User(walletAddress);

    await user.init();

    const voted = await user.castVote(proposal, decision, nonce.nonce);

    return res.send(voted);
  }
  return res.send('you trying to hack my g??');
}
