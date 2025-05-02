"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getAllOrganizations = async () => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    const { data } = await axios.get(`${process.env.API_URL}/organizations`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch organizations" };
  }
};
