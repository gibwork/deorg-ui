"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export interface Withdraw {
  payer: string;
  strategy: string;
  priorityFeeLevel: string;
}
interface ErrorRes {
  status_code: number;
  message: string;
}
export const withdrawToken = async (
  payload: Withdraw,
  claimId: string,
  claimType: string
) => {
  const { getToken, orgId } = auth();
  const reqHeaders = headers();

  const token = await getToken();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/transactions/${claimType}/withdraw/${claimId}`,
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
  transactionId: string;
  serializedTransaction: string;
}

export const confirmWithdrawTransaction = async (
  payload: ConfirmDepositTransaction,
  claimId: string,
  claimType: string
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/${claimType}/${claimId}/claim`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    revalidatePath(`/dashboard`);
    revalidatePath(`/${claimType}/${claimId}`);
    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};

export const withdrawToDecafWallet = async (
  claimId: string,
  claimType: string
) => {
  const { getToken, orgId } = auth();
  const reqHeaders = headers();

  const token = await getToken();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/${claimType}/${claimId}/claim-decaf`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "X-Client-IP": ip,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/dashboard`);
    revalidatePath(`/${claimType}/${claimId}`);
    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
