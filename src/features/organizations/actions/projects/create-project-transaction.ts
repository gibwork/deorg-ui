"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { ErrorResponse } from "@/types/types.error";
import { AxiosError } from "axios";

export type CreateProjectTransactionPayload = {
  organizationId: string;
  name: string
  members: string[]
  projectProposalThreshold: number
  projectProposalValidityPeriod: number
}

export async function createProjectTransaction(payload: CreateProjectTransactionPayload) {
  const { getToken } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/Transactions/proposals/projects`,
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