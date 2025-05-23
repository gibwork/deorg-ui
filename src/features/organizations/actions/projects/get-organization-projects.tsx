"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { ErrorResponse } from "@/types/types.error";

export type Project = {
  accountAddress: string;
  organization: string;
  uuid: string;
  title: string;
  members: {
    id: string;
    externalId: string;
    username: string;
    walletAddress: string;
    profilePicture: string;
    createdAt: string;
    updatedAt: string;
  }[];
  taskApprovalThreshold: number;
  validityEndTime: number;
  isActive: boolean;
};

export async function getOrganizationProjects(
  organizationId: string,
  page: number,
  status: string
) {
  const { getToken } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.get<Project[]>(
      `${process.env.API_URL}/projects/organization/${organizationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const completedProjects: Project[] = [];

    return { success: { activeProjects: data, completedProjects } };
  } catch (error) {
    const errorData = (error as AxiosError).response?.data as ErrorResponse;
    return { error: errorData };
  }
}
