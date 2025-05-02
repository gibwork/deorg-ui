"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

interface ErrorRes {
  status_code: number;
  message: string;
}

export const walletSignIn = async (
  publicKey: string,
  signature: any,
  blinks: boolean = false
) => {
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/auth/wallet-signin`,
      { publicKey, signature: signature, blinks },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    revalidatePath(`/`);

    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
