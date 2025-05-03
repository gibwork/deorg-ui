"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const proposeContributorRequest = async (organizationId: string, candidateWallet: string) => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const { data } = await axios.post(
      `${process.env.API_URL}/transactions/proposals/contributor`,
      {
        organizationId,
        candidateWallet,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      } 
    );
    return { success: data };
  } catch (error: any) {
    console.error(error.response.data);
    return { error: "Failed to propose contributor request" };
  }
};