import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import { useWeb3ModalSigner } from "@web3modal/ethers5/react";
import { signMessage } from "@/utils/walletFunctions";
import { useWeb3ModalAccount } from "@web3modal/ethers5/react";
import { castVote, getActiveProposals, getUser } from "@/utils/routeFunctions";
import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import { Document } from "mongoose";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import formatNumberDisplay from "@/utils/formatNumberDisplay";
import formatToDecimals from "@/utils/formatToDecimals";

interface Votes {
  yes: number;
  yesWeight: string;
  no: number;
  noWeight: string;
  abstain: number;
  abstainWeight: string;
}

interface ProposalModel extends Document {
  id: typeof uuidv4;
  proposal: string;
  active: boolean;
  votes: Votes;
}

type VoteTypes = "YES" | "NO" | "ABSTAIN";

interface Vote {
  proposal: typeof uuidv4;
  vote: VoteTypes;
  weight: string;
  nonce: string;
}

interface UserModel extends Document {
  walletAddress: string;
  tokenBalance: string;
  votes: [Vote];
}

export default function Home() {
  const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);
  const { signer } = useWeb3ModalSigner();
  const [activeProposals, setActiveProposals] = useState<ProposalModel[]>();
  const [user, setUser] = useState<UserModel>();
  const [decision, setDecision] = useState<"YES" | "NO" | "ABSTAIN" | null>();
  const { address, isConnected } = useWeb3ModalAccount();
  const [totalVotes, setTotalVotes] = useState<number>(0);

  useEffect(() => {
    (async () => {
      setActiveProposals((await getActiveProposals()).payload);
    })();
  }, []);

  useEffect(() => {
    if (activeProposals && activeProposals[0]) {
      setTotalVotes(Number(activeProposals[0].votes.yesWeight) + Number(activeProposals[0].votes.noWeight) + Number(activeProposals[0].votes.abstainWeight));
    }
  }, [activeProposals]);

  useEffect(() => {
    if (!isConnected) return;
    (async () => {
      if (address) {
        const user = await getUser(address as string);
        setUser(user.payload);
      }
    })();
  }, [address]);

  const closeAll = () => {
    setIsConnectHighlighted(false);
  };

  async function vote(proposalId: typeof uuidv4, decision: string) {
    const vote = `${proposalId}.${decision}.${uuidv4()}`;
    const res = await castVote(signer as ethers.providers.JsonRpcSigner, await signMessage(signer as ethers.providers.JsonRpcSigner, vote), vote);
    toast(res.reason);
  }

  return (
    <>
      <Head>
        <title>Brick DAO</title>
        <meta name="description" content="Brick DAO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <div
          className={styles.backdrop}
          style={{
            opacity: isConnectHighlighted ? 1 : 0,
          }}
        />
        <div className={styles.header}>
          <div className={styles.logo}>
            <Image src="/brick-logo.png" alt="WalletConnect Logo" height="65" width="65" />
            <h2>Brick DAO</h2>
          </div>
          <div className={styles.buttons}>
            <div onClick={closeAll} className={`${styles.highlight} ${isConnectHighlighted ? styles.highlightSelected : ``}`}>
              <w3m-button />
            </div>
          </div>
        </div>
      </header>
      <ToastContainer theme="dark" />
      <main className={styles.main}>
        <section className={styles.proposalSection}>
          {activeProposals && activeProposals.length > 0 ? (
            <>
              <div className={styles.proposalWrapper}>
                <h2 className={styles.proposalTitle}>{activeProposals[0].proposal}</h2>
                <p className={styles.proposalDescription}>**You may only vote once, transferring tokens in or out of the voting wallet will alter your voting weight.</p>
                {signer ? (
                  <>
                    {user && user.votes.find((vote) => vote.proposal == activeProposals[0].id) ? (
                      <div className={styles.alreadyVotedMessage}>You have already voted: {user.votes.find((vote) => vote.proposal == activeProposals[0].id)?.vote}</div>
                    ) : (
                      <div className={styles.decisionButtonWrapper}>
                        <button onClick={() => setDecision("YES")} style={{ backgroundColor: decision === "YES" ? "green" : "transparent" }} className={styles.decisionButton}>
                          Yes
                        </button>
                        <button onClick={() => setDecision("NO")} style={{ backgroundColor: decision === "NO" ? "green" : "transparent" }} className={styles.decisionButton}>
                          No
                        </button>
                        <button onClick={() => setDecision("ABSTAIN")} style={{ backgroundColor: decision === "ABSTAIN" ? "green" : "transparent" }} className={styles.decisionButton}>
                          Abstain
                        </button>
                        <div className={styles.voteButton} style={{ backgroundColor: decision != null ? "var(--wui-color-accent-100)" : "var(--color-grey-950)" }} onClick={() => vote(activeProposals[0].id, decision!)}>
                          Vote
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.buttons} style={{ marginTop: "10px" }}>
                    <div onClick={closeAll} className={`${styles.highlight} ${isConnectHighlighted ? styles.highlightSelected : ``}`}>
                      <w3m-button label="Connect To Vote" />
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.proposalInfoWrapper}>
                <h2 className={styles.proposalInfoTitle}>Current Results</h2>
                <div className={styles.proposalInfo}>
                  <div>
                    Yes <span style={{ color: "var(--wui-color-accent-100)", fontWeight: "600" }}>{totalVotes == 0 ? "0" : String(((Number(activeProposals[0].votes.yesWeight) / totalVotes) * 100).toFixed(1))}%</span>
                  </div>
                  <div>
                    <b>{formatNumberDisplay(Number(formatToDecimals(activeProposals[0].votes.yesWeight, 9)), 5)}</b> BRICK
                  </div>
                </div>
                <div className={styles.proposalInfo}>
                  <div>
                    No <span style={{ color: "var(--wui-color-accent-100)", fontWeight: "600" }}>{totalVotes == 0 ? "0" : String(((Number(activeProposals[0].votes.noWeight) / totalVotes) * 100).toFixed(1))}%</span>
                  </div>
                  <div>
                    {" "}
                    <b>{formatNumberDisplay(Number(formatToDecimals(activeProposals[0].votes.noWeight, 9)), 5)}</b> BRICK
                  </div>
                </div>
                <div className={styles.proposalInfo}>
                  <div>
                    Abstain <span style={{ color: "var(--wui-color-accent-100)", fontWeight: "600" }}>{totalVotes == 0 ? "0" : String(((Number(activeProposals[0].votes.abstainWeight) / totalVotes) * 100).toFixed(1))}%</span>
                  </div>
                  <div>
                    <b>{formatNumberDisplay(Number(formatToDecimals(activeProposals[0].votes.abstainWeight, 9)), 5)}</b> BRICK
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.proposalWrapper}>
              <h2 className={styles.proposalTitle}>No Active Proposals</h2>
              <p className={styles.proposalDescription}>There are currently no active proposals in progress</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
