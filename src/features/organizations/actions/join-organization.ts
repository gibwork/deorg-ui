"use server";

import { ErrorResponse } from "@/types/types.error";
import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";

export const joinOrganization = async (organizationId: string) => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    const { data } = await axios.post(
      `${process.env.API_URL}/organizations/${organizationId}/join`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorResponse;
    return { error: data };
  }
};
