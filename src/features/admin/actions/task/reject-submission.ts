"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

interface ErrorRes {
  status_code: number;
  message: string;
}
export const rejectSubmissionAsAdmin = async (
  taskId: string,
  submissionId: string,
  reason?: string
) => {
  const { getToken, sessionClaims } = auth();
  const token = await getToken();

  const isAdmin = sessionClaims?.role == "admin";

  if (!isAdmin) return { error: { message: "Unauthorized!" } };

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/admin/tasks/${taskId}/submission/${submissionId}/reject`,
      { rejectReason: reason },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath(`/tasks/${taskId}`);

    console.log(data);

    return { success: data };
  } catch (error) {
    console.log(error);
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
