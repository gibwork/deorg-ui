"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
export interface AnswerPayload {
  content: string;
}
interface ErrorRes {
  status_code: number;
  message: string;
}
export const createTaskSubmission = async (
  payload: AnswerPayload,
  qid: string
) => {
  const { getToken } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/tasks/${qid}/submision`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/tasks/${qid}`);

    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
