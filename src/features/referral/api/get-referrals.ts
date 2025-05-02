"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getReferrals = async (page: number) => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/referral?page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch user data" };
  }
};
