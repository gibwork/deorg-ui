"use server";
import axios from "axios";

export async function getContributors({
  page,
  query,
  categories,
  sort,
}: {
  page?: number;
  query?: string;
  categories?: string;
  sort?: string;
}) {
  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/talents?page=${page}${
        query ? `&search=${query}` : ""
      }${categories ? `&categories=${categories}` : ""}${
        sort ? `&sort=${sort}` : ""
      }`
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch Contributors" };
  }
}