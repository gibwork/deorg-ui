"use server";

import axios, { AxiosError } from "axios";
import { auth } from "@clerk/nextjs/server";
import { ErrorResponse } from "@/types/types.error";

export interface ContributorVotesResponse {
  votes: {
    totalVotes: number;
    yesVotes: number;
    noVotes: number;
    yesPercentage: number;
  };
  hasVoted: boolean;
  userVote: boolean | null;
  thresholdPercentage: number;
  hasMetThreshold: boolean;
}

export const getContributorVotes = async ({
  organizationId, 
  memberId
}: {
  organizationId: string;
  memberId: string;
}) => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const { data } = await axios.get<ContributorVotesResponse>(
      `${process.env.API_URL}/organizations/${organizationId}/contributors/${memberId}/votes`,
      {
        headers: {
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
