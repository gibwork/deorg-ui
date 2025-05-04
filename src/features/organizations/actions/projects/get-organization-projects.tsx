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

    // const activeProjects = [
    //   {
    //     id: 1,
    //     title: "Frontend Redesign",
    //     description:
    //       "Redesign the frontend UI to improve user experience and conversion rates.",
    //     status: "in_progress",
    //     progress: 45,
    //     budget: 1200,
    //     spent: 540,
    //     startDate: "2023-06-01",
    //     endDate: "2023-07-15",
    //     contributors: [
    //       { name: "Alice", avatar: "/placeholder.svg?height=32&width=32" },
    //       { name: "Bob", avatar: "/placeholder.svg?height=32&width=32" },
    //     ],
    //     milestones: [
    //       { title: "Design Phase", status: "completed", dueDate: "2023-06-15" },
    //       {
    //         title: "Implementation",
    //         status: "in_progress",
    //         dueDate: "2023-07-01",
    //       },
    //       {
    //         title: "Testing & Launch",
    //         status: "not_started",
    //         dueDate: "2023-07-15",
    //       },
    //     ],
    //     tasks: {
    //       total: 12,
    //       completed: 5,
    //     },
    //     votingStatus: {
    //       status: "approved",
    //       votesFor: 5,
    //       votesAgainst: 0,
    //       totalVotes: 5,
    //     },
    //   },
    //   {
    //     id: 2,
    //     title: "Smart Contract Audit",
    //     description:
    //       "Comprehensive audit of all smart contracts to ensure security and efficiency.",
    //     status: "pending_approval",
    //     progress: 0,
    //     budget: 2000,
    //     spent: 0,
    //     startDate: "2023-07-01",
    //     endDate: "2023-08-15",
    //     contributors: [],
    //     milestones: [
    //       {
    //         title: "Initial Review",
    //         status: "not_started",
    //         dueDate: "2023-07-15",
    //       },
    //       {
    //         title: "Vulnerability Testing",
    //         status: "not_started",
    //         dueDate: "2023-08-01",
    //       },
    //       {
    //         title: "Final Report",
    //         status: "not_started",
    //         dueDate: "2023-08-15",
    //       },
    //     ],
    //     tasks: {
    //       total: 8,
    //       completed: 0,
    //     },
    //     votingStatus: {
    //       status: "voting",
    //       votesFor: 3,
    //       votesAgainst: 1,
    //       totalVotes: 5,
    //     },
    //   },
    // ];

    // const completedProjects = [
    //   {
    //     id: 3,
    //     title: "Marketing Campaign",
    //     description:
    //       "Launch a marketing campaign to increase user acquisition.",
    //     status: "completed",
    //     progress: 100,
    //     budget: 800,
    //     spent: 750,
    //     startDate: "2023-05-01",
    //     endDate: "2023-06-01",
    //     contributors: [
    //       { name: "Charlie", avatar: "/placeholder.svg?height=32&width=32" },
    //       { name: "Dave", avatar: "/placeholder.svg?height=32&width=32" },
    //     ],
    //     milestones: [
    //       {
    //         title: "Strategy Development",
    //         status: "completed",
    //         dueDate: "2023-05-15",
    //       },
    //       {
    //         title: "Content Creation",
    //         status: "completed",
    //         dueDate: "2023-05-25",
    //       },
    //       {
    //         title: "Campaign Launch",
    //         status: "completed",
    //         dueDate: "2023-06-01",
    //       },
    //     ],
    //     tasks: {
    //       total: 10,
    //       completed: 10,
    //     },
    //     votingStatus: {
    //       status: "approved",
    //       votesFor: 5,
    //       votesAgainst: 0,
    //       totalVotes: 5,
    //     },
    //   },
    // ];

    // return { success: { activeProjects, completedProjects } };
  } catch (error) {
    const errorData = (error as AxiosError).response?.data as ErrorResponse;
    return { error: errorData };
  }
}
