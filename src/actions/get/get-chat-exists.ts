"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export async function getChatExists(userId: string) {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/messages/chat/user/${userId}/exists`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
    });

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch chat exists" };
  }
}
