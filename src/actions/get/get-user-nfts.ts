"use server";

import axios from "axios";
import { auth } from "@clerk/nextjs/server";

export const getUserNfts = async (collectionAddress?: string) => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const searchParam =
      collectionAddress && !!collectionAddress.trim().length
        ? `?collectionAddress=${collectionAddress}`
        : "";
    const { data } = await axios.get(
      `${process.env.API_URL}/users/nfts${searchParam}`,
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
