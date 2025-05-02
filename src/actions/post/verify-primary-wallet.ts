"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

interface ErrorRes {
  status_code: number;
  message: string;
}

export const verifyPrimaryWallet = async (
  publicKey: string,
  signature: any
) => {
  const { getToken } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/users/verify-wallet`,
      { publicKey, signature: signature },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/`);

    return { success: data };
  } catch (error) {
    console.log(error);
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
