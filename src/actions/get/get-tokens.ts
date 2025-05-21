"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getTokens = async (page: number) => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/tokens?page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (data?.length === 0) {
      return { error: "Could not fetch tokens" };
    }
    return { success: data };
  } catch (error) {
    return { error: "Could not fetch tokens" };
  }
};

export const getTokensList = async () => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/tokens?limit=1000`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (data?.length === 0) {
      return { error: "Could not fetch tokens" };
    }
    return { success: data };
  } catch (error) {
    return { error: "Could not fetch tokens" };
  }
};

export const searchToken = async (searchToken: string) => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/tokens?search=${searchToken}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch tasks" };
  }
};

export const getExculededTokens = async (
  searchToken: string,
  excludedTokens: string[]
) => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();
    const excludeParams = excludedTokens
      .map((token) => `exclude=${token}`)
      .join("&");

    const { data } = await axios.get(
      `${process.env.API_URL}/tokens?limit=50&page=${searchToken}&${excludeParams}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch tasks" };
  }
};
