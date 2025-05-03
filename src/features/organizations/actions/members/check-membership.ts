"use server";

import axios, { AxiosError } from "axios";
import { auth } from "@clerk/nextjs/server";
import { ErrorResponse } from "@/types/types.error";

export const checkMembership = async (organizationId: string) => {
  try {
    const { getToken, userId } = auth();
    const token = await getToken();

    if (!userId) {
      return { error: { message: "User not authenticated" } };
    }

    const { data } = await axios.get(
      `${process.env.API_URL}/organizations/${organizationId}/check-membership`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return { success: { isMember: false } };
    }
    const data = axiosError.response?.data as ErrorResponse;
    return { error: data };
  }
};
