import { ethers } from "ethers"

export async function signMessage(signer: ethers.providers.JsonRpcSigner, message: string){
    return await signer!.signMessage(message)
}