"use server";

import { Task } from "@/types/types.work";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getAllTasks = async (page: number) => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    const { data } = await axios.get(`${process.env.API_URL}/tasks?page=${page}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch tasks" };
  }
};
