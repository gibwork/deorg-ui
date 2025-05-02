"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const proposeContributorRequest = async (organizationId: string, candidateId: string) => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const { data } = await axios.post(
      `${process.env.API_URL}/transactions/proposals/contributor`,
      {
        organizationId,
        candidateId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      } 
    );
    return { success: data };
  } catch (error) {
    console.error(error);
    return { error: "Failed to propose contributor request" };
  }
};