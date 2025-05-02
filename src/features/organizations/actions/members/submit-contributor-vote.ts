"use server";

import axios, { AxiosError } from "axios";
import { auth } from "@clerk/nextjs/server";
import { ErrorResponse } from "@/types/types.error";

export const submitContributorVote = async ({
  organizationId,
  candidateId,
  vote
}: {
  organizationId: string;
  candidateId: string;
  vote: boolean;
}) => {
  try {
    const { getToken, userId } = auth();
    const token = await getToken();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { data } = await axios.post(
      `${process.env.API_URL}/organizations/${organizationId}/contributors/${candidateId}/vote`,
      {
        organizationId,
        candidateId,
        voterId: userId,
        vote
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
    const axiosError = error as AxiosError;
    const data = axiosError.response?.data as ErrorResponse;
    return { error: data };
  }
};
