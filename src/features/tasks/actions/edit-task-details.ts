"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

interface ErrorRes {
  status_code: number;
  message: string;
}
export const EditTaskDetails = async (
  taskId: string,
  content: string,
  requirements: string
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.patch(
      `${process.env.API_URL}/tasks/${taskId}`,
      { content, requirements },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/tasks/${taskId}`);
    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
