"use server";

import { Question } from "@/types/types.work";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getAllQuestions = async () => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    const { data } = await axios.get(`${process.env.API_URL}/questions`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const modifiedData = data.sort((a: Question, b: Question) => {
      if (a.isOpen && !b.isOpen) return -1;
      if (!a.isOpen && b.isOpen) return 1;
      return 0;
    });

    return { success: modifiedData };
  } catch (error) {
    return { error: "Could not fetch questions" };
  }
};
