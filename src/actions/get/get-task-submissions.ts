"use server";

import type { TaskSubmission } from "@/types/types.work";
import axios from "axios";
import { auth } from "@clerk/nextjs/server";

type GetTaskSubmissionsParams = {
  taskId: string;
  status?: string;
  page: number;
};

type GetTaskSubmissionsResponse = {
  lastPage: number;
  limit: number;
  page: number;
  total: number;
  results: TaskSubmission[];
};

export const getTaskSubmissions = async (params: GetTaskSubmissionsParams) => {
  try {
    const { getToken } = auth();
    const token = await getToken();
    const statusParam = !!params.status?.length ? `&status=${params.status}` : ''
    
    const { data } = await axios.get<GetTaskSubmissionsResponse>(
      `${process.env.API_URL}/tasks/${params.taskId}/submissions?page=${params.page}${statusParam}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch task submissions" };
  }
};
