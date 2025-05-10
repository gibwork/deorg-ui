"use server";

import { ErrorResponse } from "@/types/types.error";
import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

interface CreateOrganizationPayload {
  transactionId: string;
  serializedTransaction: string;
  name: string;
  description?: string;
  token?: RequiredToken | null;
}

interface RequiredToken {
  mintAddress: string;
  symbol: string;
  imageUrl: string;
  amount: number;
}

export const createOrganization = async (
  payload: CreateOrganizationPayload
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/organizations`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(data);

    revalidatePath(`/`);
    revalidatePath(`/organizations`);
    return { success: data };
  } catch (error) {
    console.log(error);
    const data = (error as AxiosError).response?.data as ErrorResponse;
    return { error: data };
  }
};

export type CreateOrganizationFormDataType = {
  name: string;
  contributorProposalThreshold: number;
  contributorProposalValidityPeriod: number;
  contributorValidityPeriod: number;
  contributorProposalQuorumPercentage: number;
  projectProposalValidityPeriod: number;
  projectProposalThreshold: number;
  minimumTokenRequirement: number;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  telegramUrl?: string;
  // rolePromotionRequirement: "majority" | "supermajority" | "consensus";
};

export const prepareCreateOrganization = async (
  payload: CreateOrganizationFormDataType
) => {
  const { getToken } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/transactions/organization`,
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
    console.log(error);
    const data = (error as AxiosError).response?.data as ErrorResponse;
    return { error: data };
  }
};
