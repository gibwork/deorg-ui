"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createMetadataImage } from "./create-metadata-image";
import { createBlinksImage } from "./create-blinks-image";

export interface Deposit {
  payer: string;
  strategy: string;
  token: {
    mintAddress: string;
    amount: number;
  };
  network?: string;
  priorityFeeLevel: string;
  maxPriorityFee: number | null;
  priorityFee: number | null;
  workType: string;
  referral: string | null;
}

interface ErrorRes {
  statusCode: number;
  message: string;
}
export const depositToken = async (payload: Deposit) => {
  const { getToken, orgId } = auth();
  const reqHeaders = headers();

  const token = await getToken();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/transactions/deposit`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Client-IP": ip,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    console.error(error);
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};

interface ConfirmDepositTransaction {
  title: string;
  content: string;
  requirements: string;
  tags: string[];
  transactionId: string;
  serializedTransaction: string;
  isHidden: boolean;
  isFeatured: boolean;
  deadline: Date;
  nftCollectionId?: string;
  token?: RequiredToken | null;
}

interface RequiredToken {
  mintAddress: string;
  symbol: string;
  imageUrl: string;
  amount: number;
}

export const confirmTaskDepositTransaction = async (
  payload: ConfirmDepositTransaction
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.post(`${process.env.API_URL}/tasks`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Fire-and-forget the following operations
    Promise.allSettled([
      createMetadataImage("task", data).catch((err) => {
        console.error("Error creating metadata image:", err);
      }),
      createBlinksImage(data).catch((err) => {
        console.error("Error creating blinks image:", err);
      }),
    ]);
    revalidatePath(`/`);
    revalidatePath(`/tasks`);
    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
