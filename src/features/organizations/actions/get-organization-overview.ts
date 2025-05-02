"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getOrganizationOverview = async (organizationId: string) => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    // const { data } = await axios.get(
    //   `${process.env.API_URL}/organizations/${organizationId}/overview`,
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${token}`,
    //     },
    //   }
    // );

    const recentActivity = [
      {
        type: "proposal",
        title: "Frontend Redesign",
        status: "APPROVED",
        time: "2 hours ago",
      },
      {
        type: "task",
        title: "Implement Wallet Connect",
        status: "COMPLETED",
        time: "1 day ago",
      },
      {
        type: "member",
        title: "Alice joined as Contributor",
        status: "NEW",
        time: "2 days ago",
      },
      {
        type: "transaction",
        title: "Paid 25 SOL to Bob",
        status: "COMPLETED",
        time: "3 days ago",
      },
    ];

    // Mock data for featured projects
    const featuredProjects = [
      {
        id: 1,
        title: "Frontend Redesign",
        description:
          "Redesign the frontend UI to improve user experience and conversion rates.",
        status: "IN_PROGRESS",
        progress: 45,
        budget: 1200,
        spent: 540,
        startDate: "2023-06-01",
        endDate: "2023-07-15",
        contributors: [
          { name: "Alice", avatar: "/placeholder.svg?height=32&width=32" },
          { name: "Bob", avatar: "/placeholder.svg?height=32&width=32" },
        ],
        milestones: [
          { title: "Design Phase", status: "completed", dueDate: "2023-06-15" },
          {
            title: "Implementation",
            status: "in_progress",
            dueDate: "2023-07-01",
          },
          {
            title: "Testing & Launch",
            status: "not_started",
            dueDate: "2023-07-15",
          },
        ],
        tasks: {
          total: 12,
          completed: 5,
        },
        votingStatus: {
          status: "APPROVED",
          votesFor: 5,
          votesAgainst: 0,
          totalVotes: 5,
        },
      },
      {
        id: 2,
        title: "Smart Contract Audit",
        description:
          "Comprehensive audit of all smart contracts to ensure security and efficiency.",
        status: "VOTING",
        progress: 0,
        budget: 2000,
        spent: 0,
        startDate: "2023-07-01",
        endDate: "2023-08-15",
        contributors: [],
        milestones: [
          {
            title: "Initial Review",
            status: "NOT_STARTED",
            dueDate: "2023-07-15",
          },
          {
            title: "Vulnerability Testing",
            status: "NOT_STARTED",
            dueDate: "2023-08-01",
          },
          {
            title: "Final Report",
            status: "NOT_STARTED",
            dueDate: "2023-08-15",
          },
        ],
        tasks: {
          total: 8,
          completed: 0,
        },
        votingStatus: {
          status: "VOTING",
          votesFor: 3,
          votesAgainst: 1,
          totalVotes: 5,
        },
      },
    ];

    return { success: { recentActivity, featuredProjects } };

    // return { success: data };
  } catch (error) {
    return { error: "Could not fetch organization overview" };
  }
};
