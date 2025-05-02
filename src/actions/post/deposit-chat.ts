"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError }   from "axios";
import { headers } from "next/headers";

type DepositChat = {
  userId: string;
};

type ErrorRes = {
  statusCode: number;
  message: string;
}

export async function depositChat(payload: DepositChat) {
  const { getToken, orgId } = auth();
  const reqHeaders = headers();

  const token = await getToken();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/transactions/chat/deposit`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Client-IP": ip,
          Authorization: `Bearer ${token}`,
        },
      }
    );  

    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
}
