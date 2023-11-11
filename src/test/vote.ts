import ganache from 'ganache-cli';
import express from 'express';
import { ethers } from 'ethers';
import axios from 'axios';
import dotenv from 'dotenv';
import { before, describe, it } from 'mocha';
dotenv.config();
import proposal from '../models/proposal.model';
import { v4 as uuidv4 } from 'uuid';
import assert from 'assert';
import mongoose from 'mongoose';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';

const {MONGODB_PASSWORD, MONGODB_SERVER, MONGODB_USERNAME, DATABASE_TEST, JSON_RPC_URL} = process.env;

const forkOptions = {
  fork: JSON_RPC_URL,
  network_id: 1,
};

const server = ganache.server(forkOptions);
const port = 8546;

chai.use(chaiHttp);

mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${DATABASE_TEST}`);

describe('Vote Tests', async () => {
  let provider: ethers.JsonRpcProvider;
  const accountList: any[] = [];

  before('Start fork', () => {
    // Start the eth fork
    // Start fork on port
    server.listen(port, async (err: any, blockchain: any) => {
      console.log('Forking successful on port:', port);
      
      provider = new ethers.JsonRpcProvider(`http://localhost:${port}`);
      
      // Retrieve accounts
      const accounts = blockchain ? blockchain.accounts : null;
      if (accounts) {
        Object.keys(accounts).forEach((account) => {
          accountList.push(accounts[account]);
        });
      }
    });

  });   

  beforeEach('Clear Test Database Collection', () => {
    return new Promise<void>((resolve) => {
      mongoose.connection.dropCollection('users').then(resolve); 
    });

  });

  beforeEach('Create a new proposal', (done) => {
    return new Promise<void>((resolve) => {
      mongoose.connection.dropCollection('proposals').then(async () => {
        const activeProposals = await proposal.find({ active: true });
      
        for (const active of activeProposals) {
          active.active = false;
          await active.save();
        }
        
        await proposal.create({
          id: uuidv4(),
          proposal: 'Test proposal',
          active: true,
          votes: {
            yes: 0,
            yesWeight: '0',
            no: 0,
            noWeight: '0',
            abstain: 0,
            abstainWeight: '0',
          },
        });

        resolve();
      }); 
      done();
    });

  });   


  it('Successfully Vote From Fresh Wallet', async function() {
    // Create wallet
    const account = new ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);

    // Get proposal
    const activeProposal = await proposal.findOne({ active: true });
    console.log(activeProposal);
    assert.notEqual(activeProposal, null);
    // Generate random nonce
    const nonce = uuidv4();

    const vote = `${activeProposal!.id}.YES.${nonce}`;
    const signedMessage = await account.signMessage(vote);
    
    chai.request(app).post('/vote/cast').send({
      vote: vote,
      walletAddress: account.address,
      voteSignature: signedMessage,
    }).end((err, res) => {
      console.log(res.body);
      assert.equal(res.body.voted, true);
    });
  });

  it('Revoke Second Vote From Fresh Wallet On Same Proposal With Different Nonce', async function() {
    // // Create wallet
    // const account = new ethers.Wallet(accountList[0].secretKey.toString('hex'), provider);

    // // Get proposal
    // const activeProposal = await proposal.findOne({ active: true });
    // assert.notEqual(activeProposal, null);
    // // Generate random nonce
    // const nonce = uuidv4();

    // const vote1 = `${activeProposal!.id}.YES.${nonce}`;
    // const signedMessage1 = await account.signMessage(vote1);

    // const vote2 = `${activeProposal!.id}.YES.${nonce}`;
    // const signedMessage2 = await account.signMessage(vote1);
    
    // const res1 = await chai.request(app).post('/vote/cast').send({
    //   vote: vote1,
    //   walletAddress: account.address,
    //   voteSignature: signedMessage1,
    // });

    // assert.equal(res1.body.voted, true);

    // const res2 = await chai.request(app).post('/vote/cast').send({
    //   vote: vote2,
    //   walletAddress: account.address,
    //   voteSignature: signedMessage2,
    // });

    // assert.equal(res2.body.voted, false);
  });
});




