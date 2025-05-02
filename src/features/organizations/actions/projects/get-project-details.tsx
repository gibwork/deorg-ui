"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { ErrorResponse } from "@/types/types.error";

export async function getProjectDetails(
  organizationId: string,
  projectId: string
) {
  const { getToken } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/organizations/${organizationId}/projects/${projectId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    const errorData = (error as AxiosError).response?.data as ErrorResponse;
    return { error: errorData };
  }
}
