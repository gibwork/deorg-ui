"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export async function completeTask(dto: { transactionId: string, serializedTransaction: string }) {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const response = await axios.post(`${process.env.API_URL}/tasks/complete`, {
      transactionId: dto.transactionId,
      serializedTransaction: dto.serializedTransaction,
    }, {
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

export async function compeleteTaskTransaction(taskAccountAddress: string) {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const response = await axios.post(`${process.env.API_URL}/transactions/tasks/${taskAccountAddress}/complete`, {}, {
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