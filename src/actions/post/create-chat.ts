"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

type CreateChatPayload = {
  userId: string;
  content: string;
  transactionId?: string;
  serializedTransaction: string;
};

export async function createChat(payload: CreateChatPayload) {
  try {
    const { getToken } = auth();
    const token = await getToken();
  
    const { data } = await axios.post(
      `${process.env.API_URL}/messages/chat`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return { success: data };
  } catch (error) {
    console.log(error);
    return { error: "Failed to create chat" };
  }
}