"use server";

import axios from "axios";
import { auth } from "@clerk/nextjs/server";

export type Chat = {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  updatedAt: string;
  user1: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    externalId: string;
    profilePicture: string;
  };
  user2: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    externalId: string;
    profilePicture: string;
  };
  messages: {
    id: string;
    content: string;
    createdAt: string;
  }[]
  unreadCount: number;
}


export const getChats = async (): Promise<{ success?: Chat[], error?: string }> => {
  try {
    const { getToken } = auth();
    const token = await getToken();
    const { data } = await axios.get(`${process.env.API_URL}/messages/chats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: data };
  } catch (error) {
    return { error: "Could not fetch chats" };
  }
};
