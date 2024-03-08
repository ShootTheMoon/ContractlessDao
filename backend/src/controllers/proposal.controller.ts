import express from 'express';
import sendResponse from '#utils/response';
import Proposal from '#services/proposal.service';

/**
 * Get one proposal and send it in the response. Only one proposal can be found at a time.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @returns {Promise<void>}
 */
export async function get_active(req: express.Request, res: express.Response): Promise<void>{

  // Check for active proposal
  const activeProposal = new Proposal();

  // Get the active proposal
  await activeProposal.init();

  sendResponse(res, 200, true, 'Proposal found', {proposal: activeProposal.proposal});
}

