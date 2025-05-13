"use server";

import { ErrorResponse } from "@/types/types.error";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

export const createProject = async (payload: {
  organizationId: string;
  transactionId: string;
  serializedTransaction: string;
}) => {
  const { getToken } = auth();
  const token = await getToken();

  try {
    console.log(`${process.env.API_URL}/projects`);
    const { data } = await axios.post(
      `${process.env.API_URL}/projects`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    revalidatePath(`/organizations/${payload.organizationId}`);

    return {
      success: data,
    };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorResponse;
    return {
      error: data,
    };
  }
};
