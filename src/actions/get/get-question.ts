"use server";

import axios from "axios";

export const getQuestion = async (qid: string) => {
  try {
    const { data } = await axios.get(`${process.env.API_URL}/questions/${qid}`);

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch question" };
  }
};
