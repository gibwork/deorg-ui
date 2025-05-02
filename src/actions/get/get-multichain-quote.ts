"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
interface ErrorRes {
  statusCode: number;
  message: string;
}
export const getMultichainQuote = async (chain: string, amount: number) => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();
    const { data } = await axios.get(
      `${process.env.API_URL}/tokens/quote?chain=${chain}&amount=${amount}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};
