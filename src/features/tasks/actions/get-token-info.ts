"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export type GetTokenInfoResponse = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  daily_volume: number;
};

export const getTokenInfo = async (tokenAddress: string) => {
  try {
    const { getToken } = auth();
    const authToken = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/tokens/${tokenAddress}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (Object.keys(data).length <= 0) throw new Error();

    return { success: data as GetTokenInfoResponse };
  } catch (error) {
    console.log(error);
    return { error: "Could not fetch token" };
  }
};
