"use server";

import { ErrorResponse } from "@/types/types.error";
import { Token } from "@/types/types.work";
import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
interface CreateProjectPayload {
  name: string;
  description: string;
  content: string;
  token: Token;
  votingDeadline: string;
  projectDeadline: string;
  organizationId: string;
}

export async function createProject(payload: CreateProjectPayload) {
  const { getToken } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/organizations/${payload.organizationId}/projects`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Revalidate the projects list page
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
}
