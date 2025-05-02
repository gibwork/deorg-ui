"use server";

import axios from "axios";

export const getBounty = async (qid: string) => {
  try {
    const { data } = await axios.get(`${process.env.API_URL}/bounties/${qid}`);

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch bounty" };
  }
};
