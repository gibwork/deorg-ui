"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define validation schema for vouch data
const vouchSchema = z.object({
  content: z.string().min(72, "Message must be at least 72 characters long"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  tipAmount: z.number().min(0, "Tip amount must be positive"),
  userId: z.string().min(1, "User ID is required"),
});

// Define types
export interface VouchPayload {
  content: string;
  rating: number;
  tipAmount: number;
  userId: string;
}

interface ErrorRes {
  status_code: number;
  message: string;
}

// Create the server action
export const createVouch = async (payload: VouchPayload) => {
  const { getToken } = auth();
  const token = await getToken();
  
  try {
    // Validate the payload
    const validatedFields = vouchSchema.parse(payload);
    
    const { data } = await axios.post(
      `${process.env.API_URL}/users/vouch`,
      validatedFields,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Revalidate paths to update UI
    revalidatePath(`/p/${payload.userId}`);
    
    return { success: data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: { message: error.errors?.[0]?.message || "Validation error" } };
    } else if (error instanceof AxiosError) {
      // Using non-null assertion to match pattern in other server actions
      // This tells TypeScript we're confident this won't be undefined
      const data = (error as AxiosError).response!.data as ErrorRes;
      return { error: data };
    }
    return { error: { message: "An unexpected error occurred" } };
  }
};
