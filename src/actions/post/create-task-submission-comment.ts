"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

export interface TaskSubmissionCommentPayload {
  content: string;
}

interface ErrorRes {
  status_code: number;
  message: string;
}

export const createTaskSubmissionComment = async (
  taskId: string,
  submissionId: string,
  payload: TaskSubmissionCommentPayload
) => {
  const { getToken } = auth();
  const token = await getToken();
  
  try {
    await axios.post(
      `${process.env.API_URL}/task-submissions/${submissionId}/comments`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    revalidatePath(`/tasks/${taskId}`);

    return { success: true };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
