"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { revalidatePath } from "next/cache";

export const getExplorePageData = async (
  page: number,
  search?: string,
  tags?: string,
  orderBy?: string
) => {
  const { getToken } = auth();
  const token = await getToken();

  console.log("apiurl --", process.env.API_URL);
  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/explore?${search ? `search=${search}&` : ""}${
        tags ? `tags=${tags}&` : ""
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
    return { error: "Could not fetch tasks" };
  }
};
