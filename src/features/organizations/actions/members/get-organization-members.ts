"use server";

import axios, { AxiosError } from "axios";
import { auth } from "@clerk/nextjs/server";
import { ErrorResponse } from "@/types/types.error";

export const getOrganizationMembers = async (organizationId: string) => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/organizations/${organizationId}/members`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    const axiosError = error as AxiosError;
    const data = axiosError.response?.data as ErrorResponse;
    return { error: data };
  }
};
