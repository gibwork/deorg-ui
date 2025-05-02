"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getChatMessages = async (chatId: string) => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/messages/chat/${chatId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data.results };
  } catch (error) {
    return { error: "Could not fetch chat messages" };
  }
};
