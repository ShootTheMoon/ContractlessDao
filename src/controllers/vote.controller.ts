import { ethers } from 'ethers';

export async function post_castVote(req, res) {
  const { walletAddress, signedVote, vote } = req.body;

  const signingAddress = ethers.verifyMessage(vote, signedVote);

  if (signingAddress.toLowerCase() == walletAddress.toLowerCase()) {

  }
}
