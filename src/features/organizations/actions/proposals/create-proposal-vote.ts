"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export interface CreateProposalVoteResponse {
  success?:  {
    serializedTransaction: string;
    transactionId: string;
  };
  error?: string;
}

export async function createProposalVote(proposalId: string, vote: boolean, organizationId: string): Promise<CreateProposalVoteResponse> {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const response = await axios.post(`${process.env.API_URL}/transactions/proposals/${proposalId}/vote`, {
      vote,
      organizationId,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: response.data };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create proposal vote" };
  }
}
