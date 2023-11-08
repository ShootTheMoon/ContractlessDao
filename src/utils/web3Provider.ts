import { ethers } from 'ethers';

const {JSON_RPC_URL} = process.env;

const ethersProvider = new ethers.JsonRpcProvider(JSON_RPC_URL);

export default ethersProvider;