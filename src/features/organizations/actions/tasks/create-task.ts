"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { revalidatePath } from "next/cache";
export async function createTask(dto: {
  organizationId: string;
  transactionId: string;
  serializedTransaction: string;
}) {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const response = await axios.post(`${process.env.API_URL}/tasks`, dto, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    revalidatePath(`/organizations/${dto.organizationId}`);

    return { success: response.data };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create proposal vote" };
  }
}
