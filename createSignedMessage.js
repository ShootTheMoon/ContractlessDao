const {ethers} = require('ethers');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const wallet = ethers.Wallet.createRandom();

async function main(){
  const vote = `${uuidv4()}.NO.${uuidv4()}`;
  const signedMessage = await wallet.signMessage(vote);
    
  console.log(signedMessage, wallet.address, vote);

  const res = await axios.post('http://localhost:3000/vote/cast', {
    vote: vote,
    walletAddress: wallet.address,
    voteSignature: signedMessage
  });

  console.log(res.data);
}

main();

