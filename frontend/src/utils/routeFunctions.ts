import axios from "axios"
import { ethers } from "ethers"

export async function getActiveProposals(){
    return (await axios.get('/api/proposal/get_active')).data
}

export async function castVote(signer: ethers.providers.JsonRpcSigner, signedMessage: string, vote: string){
    const res = await axios.post('/api/vote/cast', {
        'walletAddress': await signer.getAddress(),
        'voteSignature': signedMessage,
        'vote': vote
    })
    return res.data
}

export async function getUser(walletAddress: string){
    return (await axios.get(`/api/user/get_user?userId=${walletAddress}`)).data
}
