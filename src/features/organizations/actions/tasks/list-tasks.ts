"use server"

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export type Task = {
  project: string;
  title: string;
  paymentAmount: number;
  assignee: string;
  votesFor: number;
  votesAgainst: number;
  status: string;
  voters: string[];
  transferProposal: string;
  vault: string;
};

export async function listTasks(projectAccountAddress: string): Promise<Task[]> {
  const { getToken } = auth();
  const token = await getToken();

  const response = await axios.get(`${process.env.API_URL}/tasks/project/${projectAccountAddress}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
  