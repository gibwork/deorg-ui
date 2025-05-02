"use server";

import axios from "axios";
import { auth } from "@clerk/nextjs/server";

export const revalidateUserNfts = async () => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/users/nfts/revalidate`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    console.log(error);
    return { error: "Could not fetch task" };
  }
};
