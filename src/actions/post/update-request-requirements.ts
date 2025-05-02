"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

interface ErrorRes {
  status_code: number;
  message: string;
}

export const updateRequestRequirements = async (
  serviceId: string,
  requestId: string,
  requirements: string
) => {
  const { getToken } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.patch(
      `${process.env.API_URL}/services/request/${requestId}`,
      { requirements },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/services/${serviceId}`);
    revalidatePath(`/services/${serviceId}/payments`);
    revalidatePath(`/services/${serviceId}/${requestId}`);

    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
