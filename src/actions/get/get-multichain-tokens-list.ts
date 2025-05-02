"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
interface ErrorRes {
  statusCode: number;
  message: string;
}
export const getMultichainTokensList = async () => {
  try {
    const { getToken } = auth();
    const token = await getToken();
    const { data } = await axios.get(`${process.env.API_URL}/tokens/teleswap`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
