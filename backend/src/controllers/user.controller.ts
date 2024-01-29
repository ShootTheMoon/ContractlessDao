import express from 'express';
import user from '../models/user.model';

export async function get_user(req: express.Request, res: express.Response){
  if(!req.query.userId) return res.send({msg: 'Error, no user id provided', payload: null});

  const foundUser = await user.findOne({'walletAddress': (req.query.userId as string).toLowerCase()});

  if(!foundUser) return res.send({msg: 'No user found', payload: null});

  res.send({msg: 'User found', payload: foundUser});
}