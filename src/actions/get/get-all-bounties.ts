"use server";

import { Bounty } from "@/types/types.work";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getAllBounties = async () => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    const { data } = await axios.get(`${process.env.API_URL}/bounties`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const modifiedData = data.sort((a: Bounty, b: Bounty) => {
      if (a.isOpen && !b.isOpen) return -1;
      if (!a.isOpen && b.isOpen) return 1;
      return 0;
    });
    return { success: modifiedData };
  } catch (error) {
    return { error: "Could not fetch bounties" };
  }
};
