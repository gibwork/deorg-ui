"use server";

import axios, { AxiosError } from "axios";
import { ErrorResponse } from "@/types/types.error";

export const checkMembership = async (
  organizationId: string,
  userWalletAddress: string
) => {
  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/organizations/${organizationId}/check-membership/${userWalletAddress}`,
      {
        headers: {
          "Content-Type": "application/json",
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
