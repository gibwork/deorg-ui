"use server";

import axios from "axios";
import { auth } from "@clerk/nextjs/server";

export const readChatMessages = async (chatId: string): Promise<{ success?: boolean, error?: string }> => {
  try {
    const { getToken } = auth();
    const token = await getToken();
    
    const { data } = await axios.post(
      `${process.env.API_URL}/messages/chat/${chatId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { error: "Could not mark messages as read" };
  }
};
