"use server";

import axios from "axios";

export const getOrganizationDetails = async (organizationId: string) => {
  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/organizations/${organizationId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch organization" };
  }
};
