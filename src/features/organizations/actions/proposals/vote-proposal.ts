"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export async function voteProposal(proposalId: string, organizationId: string, transactionId: string, serializedTransaction: string) {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const response = await axios.post(`${process.env.API_URL}/organizations/${organizationId}/proposals/${proposalId}/vote`, {
      transactionId,
      serializedTransaction,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: response.data };
  } catch (error) {
    console.error(error); 
    return { error: "Failed to vote proposal" };
  }
}