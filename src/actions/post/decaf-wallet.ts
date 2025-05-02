"use server";
import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
interface ErrorRes {
  status_code: number;
  message: string;
}

export async function getDecafWallet(email: string) {
  const { getToken } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/users/get-decaf-account/${email}`,
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
}

export async function connectDecafWallet(email: string, walletAddress: string) {
  const { getToken } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/users/connect-decaf`,
      { email, walletAddress },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath("/");
    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
}

export async function disconnectDecafWallet(walletAddress: string) {
  const { getToken } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/users/disconnect-decaf`,
      { walletAddress },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    revalidatePath("/");
    return { success: data };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
}
