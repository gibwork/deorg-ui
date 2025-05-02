"use server";

import { ErrorResponse } from "@/types/types.error";
import { auth, clerkClient } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
export interface PullRequestErrorRes {
  statusCode: number;
  error: {
    message: string;
    errors: [
      {
        resource: string;
        code: string;
        message: string;
      }
    ];
  };
}

interface PullReqPayload {
  title: string;
  description: string;
  bountyId: string;
  responseId: string;
  attemptId: string;
}
export const createPullRequest = async (payload: PullReqPayload) => {
  const { getToken, userId } = auth();
  const token = await getToken();

  if (!userId) return { error: "User not logged in" };

  try {
    const { data } = await axios.patch(
      `${process.env.API_URL}/attempts/${payload.attemptId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/bounties/${payload.bountyId}`);
    revalidatePath(`/bounties/${payload.bountyId}/${payload.responseId}`);

    return { success: data };
  } catch (error) {
    if ((error as AxiosError).response?.status === 422) {
      const data = (error as AxiosError).response?.data as PullRequestErrorRes;
      return { error: data };
    }

    const data = (error as AxiosError).response?.data as ErrorResponse;
    return { error: data };
  }
};
