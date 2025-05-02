"use server";

import axios, { AxiosError } from "axios";
import { auth } from "@clerk/nextjs/server";
import { ErrorResponse } from "@/types/types.error";

export const checkNominationStatus = async ({
  organizationId, 
  memberId
}: {
  organizationId: string;
  memberId: string;
}) => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/organizations/${organizationId}/contributors/${memberId}/nomination`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    // If the error is a 404, it means the nomination doesn't exist
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return { success: { exists: false } };
    }
    
    const data = axiosError.response?.data as ErrorResponse;
    return { error: data };
  }
};
