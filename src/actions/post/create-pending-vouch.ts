"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { z } from "zod";

// Define validation schema for vouch data
const pendingVouchSchema = z.object({
  content: z.string().min(10, "Message must be at least 10 characters long"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  tipAmount: z.number().min(0, "Tip amount must be positive"),
  userId: z.string().min(1, "User ID is required"),
});

// Define types
export interface PendingVouchPayload {
  content: string;
  rating: number;
  tipAmount: number;
  userId: string;
}

export interface PendingVouchResponse {
  vouch: any;
  serializedTransaction: string;
}

// Create the server action
export const createPendingVouch = async (payload: PendingVouchPayload) => {
  const { getToken } = auth();
  const token = await getToken();

  try {
    // Validate the payload
    const validatedFields = pendingVouchSchema.parse(payload);

    // Make API request
    const response = await axios.post<PendingVouchResponse>(
      `${process.env.API_URL}/users/vouch/pending`,
      validatedFields,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: response.data };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        error: { message: error.errors?.[0]?.message || "Validation error" },
      };
    } else if (axios.isAxiosError(error)) {
      // Handle Axios error with response
      const errorMessage =
        error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : error.message || "API request failed";
      return { error: { message: errorMessage } };
    }
    return {
      error: { message: error.message || "An unexpected error occurred" },
    };
  }
};
