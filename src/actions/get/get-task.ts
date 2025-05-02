"use server";

import axios from "axios";

export const getTask = async (qid: string) => {
  try {
    const { data } = await axios.get(`${process.env.API_URL}/tasks/${qid}`);

    return { success: data };
  } catch (error) {
    console.log(error);
    return { error: "Could not fetch task" };
  }
};
