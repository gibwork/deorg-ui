"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface ErrorRes {
  status_code: number;
  message: string;
}
export const banUserAsAdmin = async (userId: string, username: string) => {
  const { sessionClaims } = auth();

  try {
    const isAdmin = sessionClaims?.role == "admin";

    if (!isAdmin) return { error: "Unauthorized!" };
    const client = await clerkClient();
    const response = await client.users.banUser(userId);

    revalidatePath(`/users/${username}`);

    return { success: response?.banned };
  } catch (error) {
    console.log(error);
    return { error: "Something went wrong!" };
  }
};
