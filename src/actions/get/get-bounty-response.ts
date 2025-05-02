"use server";

import axios from "axios";

export const getBountyResponse = async (qid: string) => {
  try {
    const { data } = await axios.get(`${process.env.API_URL}/submissions/${qid}`);

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch response" };
  }
};
