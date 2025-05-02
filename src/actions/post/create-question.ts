"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import {headers} from "next/headers";
export interface Deposit {
  payer: string;
  strategy: string;
  token: {
    mintAddress: string;
    amount: number;
  };
  network?: string;
}
interface ErrorRes {
  statusCode: number;
  message: string;
}
export const depositToken = async (payload: Deposit) => {
  const { getToken, orgId } = auth();
  const reqHeaders = headers();

  const token = await getToken();
  const ip = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip')

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
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};

interface ConfirmDepositTransaction {
  title: string;
  content: string;
  category: string;
  tags: string[];
  transactionId: string;
  serializedTransaction: string;
}

export const confirmDepositTransaction = async (
  payload: ConfirmDepositTransaction
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/questions`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/questions`);
    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
