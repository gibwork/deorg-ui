"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { ErrorResponse } from "@/types/types.error";

export interface ProposalType {
  proposalAddress: string;
  organization?: string;
  candidate?: string;
  proposer: string;
  proposedRate: number;
  createdAt: string | number;
  expiresAt: number;
  votesFor: number;
  votesAgainst: number;
  votesTotal: number;
  status: string;
  id: string;
  title: string;
  description: string;
  deadline?: string | null;
  organizationId?: string;
  createdBy?: string;
  requestedAmount?: Record<string, any>;
  updatedAt?: string;
}

export async function getOrganizationProposals(
  organizationId: string,
  page: number,
  status: string
): Promise<{
  success?: { activeProposals: ProposalType[]; pastProposals: ProposalType[] };
  error?: ErrorResponse;
}> {
  const { getToken } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/organizations/${organizationId}/proposals?page=${page}&status=${status}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const activeProposals = data.filter(
      (p: ProposalType) => p.status === "active"
    );
    const pastProposals = data.filter(
      (p: ProposalType) => p.status !== "active"
    );

    return { success: { activeProposals, pastProposals } };
  } catch (error) {
    const errorData = (error as AxiosError).response?.data as ErrorResponse;
    return { error: errorData };
  }
}
