import { verifySignature } from '#middleware/authentication.middleware';
import { ethers } from 'ethers';
import express from 'express';


describe('Authentication Middleware Test', () => {
  it('should throw no error and append correct data to request body when valid parameters are provided', async () => {
    expect.assertions(5);
    // Create new wallet
    const wallet = ethers.Wallet.createRandom();
    
    const vote = 'proposal.YES.1';

    const voteSignature = await wallet.signMessage(vote);

    const mockReq = {
      body: {
        walletAddress: '',
        voteSignature: '',
        vote: '',
      },
    } as express.Request;
    const mockRes = {} as express.Response;
    const mockNext = jest.fn() as jest.Mock<express.NextFunction>;

    mockReq.body.walletAddress = wallet.address;
    mockReq.body.voteSignature = voteSignature;
    mockReq.body.vote = vote;

    verifySignature(mockReq, mockRes, mockNext);

    expect(mockReq.body.walletAddress).toBe(wallet.address);
    expect(mockReq.body.proposal).toBe(vote.split('.')[0]);
    expect(mockReq.body.decision).toBe(vote.split('.')[1]);
    expect(mockReq.body.nonce).toBe(vote.split('.')[2]);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw an error when no wallet address is provided', async () => {

    expect.assertions(3);

    // Create new wallet
    const wallet = ethers.Wallet.createRandom();
    
    const vote = 'proposal.YES.1';
 
    const voteSignature = await wallet.signMessage(vote);
 
    const mockReq = {
      body: {
        walletAddress: '',
        voteSignature: '',
        vote: '',
      },
    } as express.Request;
    const mockRes = {} as express.Response;
    const mockNext = jest.fn() as jest.Mock<express.NextFunction>;
 
    mockReq.body.voteSignature = voteSignature;
    mockReq.body.vote = vote;
 
    verifySignature(mockReq, mockRes, mockNext);

    const err = mockNext.mock.calls[0][0];

    expect(err).toHaveProperty('status', 400);
    expect(err).toHaveProperty('sendMessage', true);
    expect(err).toHaveProperty('message', 'Wallet address not provided');
  });
});