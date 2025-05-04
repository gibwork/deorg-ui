"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export async function createTaskTransaction(dto: {
  title: string;
  description: string;
  paymentAmount: number;
  memberAccountAddress: string;
  projectAccountAddress: string;
}) {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const response = await axios.post(`${process.env.API_URL}/transactions/proposals/tasks`, dto, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: response.data };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create proposal vote" };
  }
}