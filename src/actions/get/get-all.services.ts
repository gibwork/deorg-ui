"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getAllServices = async (
  page: number,
  search?: string,
  tags?: string,
  orderBy?: string
) => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    const encodedTags = encodeURIComponent(tags!);

    const { data } = await axios.get(
      `${process.env.API_URL}/services?${search ? `search=${search}&` : ""}${
        tags ? `tags=${encodedTags}&` : ""
      }${orderBy ? `orderBy=${orderBy}&` : ""}page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch services" };
  }
};
