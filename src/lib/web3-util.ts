"use server";

import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";

export const getTokenBalance = async (
  publicKey: string,
  network: string,
  tokenMint?: string,
  tokenDecimal?: number
) => {
  if (!process.env.RPC_URL) return 0;

  const solMintAddress = "So11111111111111111111111111111111111111112";

  // @todo: refactor this to use the network from the context
  const rpcUrl: string =
    network === "devnet"
      ? process.env.RPC_URL?.replace("mainnet", "devnet")
      : process.env.RPC_URL;
  const connection = new Connection(rpcUrl, "confirmed");
  try {
    const pubKey = new PublicKey(publicKey);
    if (!tokenMint || tokenMint == solMintAddress) {
      const balance = await connection.getBalance(pubKey);
      return balance / LAMPORTS_PER_SOL;
    } else {
      const mintAddress = new PublicKey(tokenMint!);
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintAddress,
        pubKey
      );
      const tokenAccount = await getAccount(connection, associatedTokenAddress);
      const balance = Number(tokenAccount.amount) / Math.pow(10, tokenDecimal!);
      return balance;
    }
  } catch (error) {
    console.log("Something went wrong", error); //new
    return 0;
  }
};
