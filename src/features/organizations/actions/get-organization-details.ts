"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getOrganizationDetails = async (organizationId: string) => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    const { data } = await axios.get(
      `${process.env.API_URL}/organizations/${organizationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch organization" };
  }
};
