import express from 'express';
import User from '#services/user.service';
import sendResponse from '#utils/response';

/**
 * Handles the POST request for casting a vote on a proposal. It extracts the wallet address, nonce, decision,
 * and proposal ID from the request body. Then, it initializes a User instance for the given wallet address,
 * prepares it for voting by setting up the necessary user details, and finally casts a vote on the specified proposal
 * with the provided decision and nonce. If successful, it responds with a 201 status code and details of the vote cast.
 *
 * @param {express.Request} req - The request object, containing the walletAddress, nonce, decision, and proposal
 * in the body.
 * @param {express.Response} res - The response object used to send back the HTTP response.
 * @async
 * @returns {Promise<void>}
 */
export async function post_castVote(req: express.Request, res: express.Response): Promise<void> {
  const { walletAddress, nonce, decision, proposal } = req.body;

  const user = new User(walletAddress);

  await user.initForVoting();

  const vote = await user.castVote(proposal, decision, nonce);

  sendResponse(res, 201, true,'Voted', vote);
}
