"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export type SearchNFTCollectionsResponse = {
  id: string;
  imageUrl: string;
  isActive: boolean;
  isVerified: boolean;
  name: string;
  symbol: string;
};

export const searchNFTCollections = async (search: string) => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const searchParam = !!search.trim().length ? `?search=${search}` : "";

    const { data } = await axios.get(
      `${process.env.API_URL}/nft-collections${searchParam}`,
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
