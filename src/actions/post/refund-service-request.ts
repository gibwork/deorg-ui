"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
export interface RequestRefundTask {
  network: string;
  priorityFeeLevel: string;
}
interface ErrorRes {
  status_code: number;
  message: string;
}
export const requestServiceRefund = async (
  payload: RequestRefundTask,
  id: string
) => {
  const { getToken, orgId } = auth();
  const reqHeaders = headers();

  const token = await getToken();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/transactions/service-request/refund/${id}`,
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

interface ConfirmRefundTransaction {
  transactionId: string;
  serializedTransaction: string;
}

export const confirmRefundTransaction = async (
  payload: ConfirmRefundTransaction,
  id: string,
  serviceId: string
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/services-request/${id}/refund`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/services/${serviceId}`);
    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
