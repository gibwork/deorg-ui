"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export interface RequestPartialRefund {
  payer: string;
  network: string;
  priorityFeeLevel: string;
}
interface ErrorRes {
  status_code: number;
  message: string;
}
export const requestPartialRefund = async (
  payload: RequestPartialRefund,
  id: string,
  type: string
) => {
  const { getToken, orgId } = auth();
  const reqHeaders = headers();

  const token = await getToken();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/transactions/${type}/partial-refund/${id}`,
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

interface ConfirmPartialRefundTransaction {
  transactionId: string;
  serializedTransaction: string;
}

export const confirmPartialRefundTransaction = async (
  payload: ConfirmPartialRefundTransaction,
  id: string,
  type: string
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/${type}/${id}/partial-refund`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/dashboard`);
    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
