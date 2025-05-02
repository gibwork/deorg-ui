"use server";
import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { headers } from "next/headers";

interface ErrorRes {
  status_code: number;
  message: string;
}
export const uploadFile = async (formData: FormData) => {
  const { getToken } = auth();
  const token = await getToken();
  const reqHeaders = headers();

  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");
  try {
    const res = await axios.post(`${process.env.API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Client-IP": ip,
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: res.data[0] };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
