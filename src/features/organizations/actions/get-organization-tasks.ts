"use server";

import { ErrorResponse } from "@/types/types.error";
import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";

export const getOrganizationTasks = async (organizationId: string) => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    // const { data } = await axios.get(`${process.env.API_URL}/organizations`, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${token}`,
    //   },
    // });

    // return { success: data };

    // Mock data for tasks
    const openTasks = [
      {
        id: 1,
        title: "Implement Wallet Connect",
        description:
          "Add support for connecting multiple wallet types to the platform.",
        status: "open",
        priority: "high",
        estimatedHours: 8,
        assignee: null,
        dueDate: "2023-06-15",
        reward: 50,
        projectId: "1",
        projectName: "Frontend Redesign",
        requiresVoting: true,
        votingStatus: {
          status: "voting",
          votesFor: 3,
          votesAgainst: 1,
          totalVotes: 5,
          endTime: "June 15, 2023",
        },
        votes: [
          {
            voter: {
              name: "Alice",
              avatar: "/placeholder.svg?height=32&width=32",
            },
            vote: "for",
            timestamp: "June 10, 2023 14:32",
            comment: "This is a critical feature we need to implement.",
          },
          {
            voter: {
              name: "Bob",
              avatar: "/placeholder.svg?height=32&width=32",
            },
            vote: "for",
            timestamp: "June 10, 2023 15:45",
          },
          {
            voter: {
              name: "Charlie",
              avatar: "/placeholder.svg?height=32&width=32",
            },
            vote: "against",
            timestamp: "June 11, 2023 09:10",
            comment: "I think we should prioritize other features first.",
          },
          {
            voter: {
              name: "Dave",
              avatar: "/placeholder.svg?height=32&width=32",
            },
            vote: "for",
            timestamp: "June 11, 2023 11:25",
          },
        ],
      },
      {
        id: 2,
        title: "Create User Documentation",
        description:
          "Write comprehensive documentation for users on how to use the platform.",
        status: "in_progress",
        priority: "medium",
        estimatedHours: 12,
        assignee: {
          name: "Alice",
          avatar: "/placeholder.svg?height=32&width=32",
          address: "alice.sol",
        },
        dueDate: "2023-06-20",
        reward: 75,
        projectId: "1",
        projectName: "Frontend Redesign",
        requiresVoting: false,
      },
      {
        id: 3,
        title: "Security Review",
        description: "Perform a security review of the smart contracts.",
        status: "open",
        priority: "high",
        estimatedHours: 20,
        assignee: null,
        dueDate: "2023-07-10",
        reward: 150,
        projectId: "2",
        projectName: "Smart Contract Audit",
        requiresVoting: true,
        votingStatus: {
          status: "approved",
          votesFor: 5,
          votesAgainst: 0,
          totalVotes: 5,
        },
        votes: [
          {
            voter: {
              name: "Alice",
              avatar: "/placeholder.svg?height=32&width=32",
            },
            vote: "for",
            timestamp: "June 5, 2023 10:15",
          },
          {
            voter: {
              name: "Bob",
              avatar: "/placeholder.svg?height=32&width=32",
            },
            vote: "for",
            timestamp: "June 5, 2023 11:30",
          },
        ],
      },
    ];

    const completedTasks = [
      {
        id: 4,
        title: "Design Landing Page",
        description:
          "Create a new design for the landing page to improve conversion rates.",
        status: "completed",
        priority: "high",
        estimatedHours: 10,
        assignee: {
          name: "Bob",
          avatar: "/placeholder.svg?height=32&width=32",
          address: "bob.sol",
        },
        completedDate: "2023-06-01",
        reward: 100,
        projectId: "3",
        projectName: "Marketing Campaign",
        requiresVoting: false,
      },
      {
        id: 5,
        title: "Create Social Media Assets",
        description: "Design social media assets for the marketing campaign.",
        status: "completed",
        priority: "medium",
        estimatedHours: 8,
        assignee: {
          name: "Charlie",
          avatar: "/placeholder.svg?height=32&width=32",
          address: "charlie.sol",
        },
        completedDate: "2023-05-25",
        reward: 80,
        projectId: "3",
        projectName: "Marketing Campaign",
        requiresVoting: false,
      },
    ];

    return { success: { openTasks, completedTasks } };
  } catch (error) {
    const axiosError = error as AxiosError;
    const data = axiosError.response?.data as ErrorResponse;
    return { error: data };
  }
};
