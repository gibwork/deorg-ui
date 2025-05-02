"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define validation schema for vouch confirmation
const confirmVouchSchema = z.object({
  signedTransaction: z.string().min(1, "Signed transaction is required"),
  vouchId: z.string().min(1, "Vouch ID is required"),
});

// Define types
export interface ConfirmVouchPayload {
  signedTransaction: string;
  vouchId: string;
}

// Create the server action
export const confirmVouch = async (payload: ConfirmVouchPayload, userId: string) => {
  const { getToken } = auth();
  const token = await getToken();
  
  try {
    // Validate the payload
    const validatedFields = confirmVouchSchema.parse(payload);
    
    const response = await axios.post(
      `${process.env.API_URL}/users/vouch/confirm`,
      validatedFields,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Revalidate paths to update UI
    revalidatePath(`/p/${userId}`);
    
    return { success: response.data };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: { message: error.errors?.[0]?.message || "Validation error" } };
    } else if (axios.isAxiosError(error)) {
      // Handle Axios error with response
      const errorMessage = error.response && error.response.data && 
                          typeof error.response.data === 'object' && 
                          'message' in error.response.data
                          ? String(error.response.data.message)
                          : error.message || "API request failed";
      return { error: { message: errorMessage } };
    }
    return { error: { message: error.message || "An unexpected error occurred" } };
  }
};
