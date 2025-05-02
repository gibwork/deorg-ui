"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
export interface ServicePayload {
  transactionId: string;
  serializedTransaction: string;
}
interface ErrorRes {
  status_code: number;
  message: string;
}
export const createServiceRequest = async (
  payload: ServicePayload,
  id: string
) => {
  const { getToken } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/services/${id}/request`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/services`);

    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
