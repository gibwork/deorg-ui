"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getUserDashboardData = async () => {
  try {
    const { getToken } = auth();
    const token = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/users/dashboard-info`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch user data" };
  }
};
