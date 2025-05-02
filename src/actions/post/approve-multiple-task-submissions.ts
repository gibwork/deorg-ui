"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

interface ErrorRes {
  status_code: number;
  message: string;
}

export const approveMultipleTaskSubmissions = async (
  taskId: string,
  taskSubmissionIds: string[],
  amount: number
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();
  
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/tasks/${taskId}/submissions/pay`,
      {
        submissionIds: taskSubmissionIds,
        amount,
      },
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

export const approveAllTaskSubmissions = async (
  taskId: string,
  amount: number
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/tasks/${taskId}/submissions/pay-all`,
      {
        amount,
      },
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
