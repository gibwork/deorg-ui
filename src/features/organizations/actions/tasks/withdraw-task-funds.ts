"use server"

import { auth } from "@clerk/nextjs/server";
import axios from "axios";


export async function withdrawTaskFunds(dto: { transactionId: string, serializedTransaction: string }) {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const response = await axios.post(`${process.env.API_URL}/tasks/withdraw-funds`, {
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

export async function withdrawTaskFundsTransaction(taskAccountAddress: string) {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const response = await axios.post(`${process.env.API_URL}/transactions/tasks/${taskAccountAddress}/withdraw-funds`, {}, {
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
