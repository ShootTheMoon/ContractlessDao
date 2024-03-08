import { ethers } from 'ethers';
import express from 'express';
import customError from '#utils/customError';

export async function verifySignature(req: express.Request, res: express.Response, next: express.NextFunction){
  const { walletAddress, voteSignature, vote } = req.body;

  // If wallet address is not provided
  if(!walletAddress) next(customError('Wallet address not provided', 400, true));
  // If wallet address is invalid
  if(!ethers.utils.isAddress(walletAddress)) next(customError('Invalid wallet address', 400, true));

  // If vote signature is not provided
  if(!voteSignature) next(customError('Vote signature not provided', 400, true));

  // If vote is not provided
  if(!vote) next(customError('Vote not provided', 400, true));

  // Get the signing address
  const signingAddress = ethers.utils.verifyMessage(vote, voteSignature);

  // Check if signature is valid
  if(signingAddress.toLowerCase() != walletAddress.toLowerCase()) next(customError('Invalid wallet signature', 401, true));

  const proposal = vote.split('.')[0];
  const decision = vote.split('.')[1];
  const nonce = vote.split('.')[2];


  req.body.proposal = proposal;
  req.body.decision = decision;
  req.body.nonce = nonce;

  next();
}