"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

interface ErrorRes {
  status_code: number;
  message: string;
}
export const startWork = async (qid: string, ref?: string | null) => {
  const { getToken, userId } = auth();
  const token = await getToken();

  if (!userId) return { error: "User not logged in" };

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/bounties/${qid}/response`,
      { referral: ref },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/bounties/${qid}`);

    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
