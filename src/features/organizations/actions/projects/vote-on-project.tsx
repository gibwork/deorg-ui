"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { ErrorResponse } from "@/types/types.error";
import { boolean } from "zod";

interface ProjectVotePayload {
  vote: boolean;
  organizationId: string;
  projectId: string;
  comment?: string;
}

export async function voteOnProject(payload: ProjectVotePayload) {
  const { getToken } = auth();
  const token = await getToken();
  const { organizationId, projectId } = payload;

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/organizations/${organizationId}/projects/${projectId}/vote`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    console.error(error);
    const errorData = (error as AxiosError).response?.data as ErrorResponse;
    return { error: errorData };
  }
}
