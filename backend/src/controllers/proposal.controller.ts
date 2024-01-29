import express from 'express';
import proposal from '../models/proposal.model';

export async function get_active(req: express.Request, res: express.Response){
  const activeProposals = await proposal.find({'active': true});
  res.send({msg: 'Proposal found', payload: activeProposals});
}

