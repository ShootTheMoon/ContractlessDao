import { ethers } from 'ethers';
import proposal from '../models/proposal.model';
import user from '../models/user.model';

const abi = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',

  // Authenticated Functions
  'function transfer(address to, uint amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)',
];

const CHECK_CHAIN_INTERVAL = 7500;

export default class Web3Service {
  private _rpcUrl: string | undefined;
  private _provider: ethers.providers.JsonRpcProvider | undefined;

  get provider(): ethers.providers.JsonRpcProvider | undefined{
    return this._provider;
  }

  public init(rpcUrl: string) {
    this._rpcUrl = rpcUrl;
    this ._provider = new ethers.providers.JsonRpcProvider(this._rpcUrl);

    if(this._provider == undefined){
      console.error('Provider not found');
      return;
    }
    this._getTokenBalancesForActiveProposals();
    
    setInterval(() => {
      this._getTokenBalancesForActiveProposals();
    }, CHECK_CHAIN_INTERVAL);
  }

  private async _getTokenBalancesForActiveProposals(){
    const activeProposals = await proposal.find({'active': true});

    if(activeProposals.length < 1) return;

    // Loop through active proposals
    for(const proposal of activeProposals){

      let yesWeightDelta: bigint = 0n;
      let noWeightDelta: bigint = 0n;
      let abstainWeightDelta: bigint = 0n;

      const activeUsers = await user.find({'votes.proposal': proposal.id});
    
      // Loop through active users
      for(const user of activeUsers){
        const oldBalance = BigInt(user.tokenBalance);

        const contract = new ethers.Contract(process.env.TOKEN_ADDRESS, abi, this.provider!);

        const newBalance = BigInt((await contract.balanceOf(user.walletAddress)).toString());

        // Compare old balance to new balance, return if same
        if(newBalance === oldBalance) return;

        // Update user token balance
        user.tokenBalance = String(newBalance);

        await user.save();
        
        // Update the vote weights
        for(const vote of user.votes){
          if (vote.proposal == proposal.id){
            if(vote.vote === 'YES'){
              yesWeightDelta += newBalance - oldBalance;
            }
            if(vote.vote === 'NO'){
              noWeightDelta += newBalance - oldBalance;
            }
            if(vote.vote === 'ABSTAIN'){
              abstainWeightDelta += newBalance - oldBalance;
            }
          }
        }
      }

      proposal.votes.yesWeight = String(BigInt(proposal.votes.yesWeight) + yesWeightDelta);
      proposal.votes.noWeight = String(BigInt(proposal.votes.noWeight) + noWeightDelta);
      proposal.votes.abstainWeight = String(BigInt(proposal.votes.abstainWeight) + abstainWeightDelta);
      
      await proposal.save();
    }
  }
}
// FOR WSS
// export default class Web3Service {
//   private _wssUrl: string | undefined;
//   private _provider: ethers.providers.WebSocketProvider | undefined;
//   private _keepAliveInterval: any = undefined;
//   private _pingTimeout: any = undefined;
//   private _tokenAddress: string | undefined;

//   get provider(): ethers.providers.WebSocketProvider | undefined{
//     return this._provider;
//   }

//   public init(wssUrl: string, tokenAddress: string) {
//     this._wssUrl = wssUrl;
//     this._tokenAddress = tokenAddress;
//     this ._provider = new ethers.providers.WebSocketProvider(this._wssUrl);

//     if(this._provider == undefined){
//       console.error('Provider not found');
//       return;
//     }

//     this._provider._websocket.on('open', () => {
//       this._keepAliveInterval = setInterval(() => {

//         this._provider!._websocket.ping();
  
//         // Use `WebSocket#terminate()`, which immediately destroys the connection,
//         // instead of `WebSocket#close()`, which waits for the close timer.
//         // Delay should be equal to the interval at which your server
//         // sends out pings plus a conservative assumption of the latency.
//         this._pingTimeout = setTimeout(() => {
//           this._provider!._websocket.terminate();
//         }, EXPECTED_PONG_BACK);
//       }, KEEP_ALIVE_CHECK_INTERVAL);
  
//       // TODO: handle contract listeners setup + indexing

//       this._provider!.on('block', (block) => {
//         console.log('New block', block);
//         this._getTokenBalancesForActiveProposals();
//       });
//     });
  
//     this._provider._websocket.on('close', () => {
//       console.error('The websocket connection was closed');
//       clearInterval(this._keepAliveInterval);
//       clearTimeout(this._pingTimeout);
//       this.init(this._wssUrl as string, this._tokenAddress as string);
//     });
  
//     this._provider._websocket.on('pong', () => {
//       clearInterval(this._pingTimeout);
//     });
//   }

//   private async _getTokenBalancesForActiveProposals(){
//     const activeProposals = await proposal.find({'active': true});

//     if(activeProposals.length < 1) return;

//     // Loop through active proposals
//     for(const proposal of activeProposals){

//       let yesWeightDelta: bigint = 0n;
//       let noWeightDelta: bigint = 0n;
//       let abstainWeightDelta: bigint = 0n;

//       const activeUsers = await user.find({'votes.proposal': proposal.id});
    
//       // Loop through active users
//       for(const user of activeUsers){
//         const oldBalance = BigInt(user.tokenBalance);

//         const contract = new ethers.Contract(process.env.TOKEN_ADDRESS, abi, this.provider!);

//         const newBalance = BigInt((await contract.balanceOf(user.walletAddress)).toString());

//         // Compare old balance to new balance, return if same
//         if(newBalance === oldBalance) return;

//         // Update user token balance
//         user.tokenBalance = String(newBalance);

//         await user.save();
        
//         // Update the vote weights
//         for(const vote of user.votes){
//           if (vote.proposal == proposal.id){
//             if(vote.vote === 'YES'){
//               yesWeightDelta += newBalance - oldBalance;
//             }
//             if(vote.vote === 'NO'){
//               noWeightDelta += newBalance - oldBalance;
//             }
//             if(vote.vote === 'ABSTAIN'){
//               abstainWeightDelta += newBalance - oldBalance;
//             }
//           }
//         }
//       }

//       proposal.votes.yesWeight = String(BigInt(proposal.votes.yesWeight) + yesWeightDelta);
//       proposal.votes.noWeight = String(BigInt(proposal.votes.noWeight) + noWeightDelta);
//       proposal.votes.abstainWeight = String(BigInt(proposal.votes.abstainWeight) + abstainWeightDelta);
      
//       await proposal.save();
//     }
//   }
// }
