"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getServiceRequestDetails = async (qid: string) => {
  if (!qid) return { error: "Invalid Request Id" };
  try {
    const { getToken } = auth();
    const token = await getToken();
    const { data } = await axios.get(
      `${process.env.API_URL}/services-request/${qid}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch Service" };
  }
};
