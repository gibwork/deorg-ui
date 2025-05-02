"use server";

import axios from "axios";

export const getMetadata = async (type: string, id: string) => {
  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/metadata/${type}/${id}`
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch metadata" };
  }
};
