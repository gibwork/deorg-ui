"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

interface ErrorRes {
  status_code: number;
  message: string;
}
export const approveService = async (serviceId: string, requestId: string) => {
  const { getToken, orgId } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/services-request/${requestId}/approve-service`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/services/${serviceId}/${requestId}`);
    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
