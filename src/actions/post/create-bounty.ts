"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { createMetadataImage } from "./create-metadata-image";

interface ErrorRes {
  status_code: number;
  message: string;
}
interface ConfirmDepositTransaction {
  externalUrl: string;
  title: string;
  overview: string;
  requirements: string;
  ghBranch?: string;
  tags: string[];
  transactionId: string;
  serializedTransaction: string;
  deadline: Date;
}

export const confirmBountyDepositTransaction = async (
  payload: ConfirmDepositTransaction
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/bounties`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    Promise.allSettled([
      createMetadataImage("bounty", data).catch((err) => {
        console.error("Error creating metadata image:", err);
      }),
    ]);
    revalidatePath(`/bounties`);
    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
