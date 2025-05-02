'use server';

import { Connection } from "@solana/web3.js";

export async function getLatestBlockhash() {
  try {
    const connection = new Connection(process.env.RPC_URL!);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    return { 
      success: true, 
      data: { blockhash, lastValidBlockHeight } 
    };
  } catch (error) {
    console.error("Error getting blockhash:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get blockhash" 
    };
  }
}
