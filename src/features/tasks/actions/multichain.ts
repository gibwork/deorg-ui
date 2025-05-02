"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";

interface MultichainTaskDepositPayload {
  title: string;
  content: string;
  requirements: string;
  tags: string[];
  isHidden: boolean;
  isBlinksEnabled: boolean;
  allowOnlyVerifiedSubmissions: boolean;
  deadline: Date;
  chain: string;
  amount: number;
}

interface MultichainBountyDepositPayload {
  title: string;
  overview: string;
  requirements: string;
  externalUrl: string;
  ghBranch: string;
  tags: string[];
  isHidden: boolean;
  allowOnlyVerifiedSubmissions: boolean;
  deadline: Date;
  chain: string;
  amount: number;
}

interface ErrorRes {
  statusCode: number;
  message: string;
}

export const createMultichainTaskDeposit = async (
  payload: MultichainTaskDepositPayload
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/tasks/multi-chain`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(data);
    return { success: data };
  } catch (error) {
    console.log(error);
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};

export const getMultichainTaskStatus = async (taskId: string) => {
  const { getToken, orgId } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/tasks/multi-chain/${taskId}`,

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

export const createMultichainBountyDeposit = async (
  payload: MultichainBountyDepositPayload
) => {
  const { getToken, orgId } = auth();
  const token = await getToken();

  try {
    const { data } = await axios.post(
      `${process.env.API_URL}/bounties/multi-chain`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(data);
    return { success: data };
  } catch (error) {
    console.log(error);
    const data = (error as AxiosError).response?.data as ErrorRes;
    return { error: data };
  }
};

export const getMultichainBountyStatus = async (bountyId: string) => {
  const { getToken } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/bounties/multi-chain/${bountyId}`,

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
