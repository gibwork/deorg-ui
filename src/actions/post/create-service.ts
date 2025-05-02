"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  requirements: z.string().min(1, "Requirements are required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  token: z.object({
    amount: z.number().positive("Amount must be positive"),
    mintAddress: z.string().min(1, "Mint address is required"),
  }),
  images: z
    .array(z.any())
    .min(1, "At least one image is required")
    .max(5, "Maximum 5 images allowed")
    .refine(
      (files) => files.every((file) => file instanceof File),
      "Invalid file type"
    )
    .refine(
      (files) => files.every((file) => file.size <= 10 * 1024 * 1024),
      "Each file must be no larger than 10MB"
    ),
  // transactionId: z.string().min(1, "Transaction ID is required"),
  // serializedTransaction: z.string().min(1, "Serialized transaction is required"),
});
interface ErrorRes {
  status_code: number;
  message: string;
}
export const createService = async (formData: FormData) => {
  const { getToken } = auth();
  const token = await getToken();

  try {
    const images = formData.getAll("images");

    const validatedFields = formSchema.parse({
      title: formData.get("title"),
      content: formData.get("content"),
      requirements: formData.get("requirements"),
      tags: JSON.parse(formData.get("tags") as string),
      token: JSON.parse(formData.get("token") as string),
      images: images,
      // transactionId: formData.get("transactionId"),
      // serializedTransaction: formData.get("serializedTransaction"),
    });

    const form = new FormData();

    // Append fields to the form
    form.append("title", validatedFields.title);
    form.append("content", validatedFields.content);
    form.append("requirements", validatedFields.requirements);
    // form.append("transactionId", validatedFields.transactionId);
    // form.append("serializedTransaction", validatedFields.serializedTransaction);

    // Append tags as an array (in multipart form, the array can be sent as multiple fields with the same name)
    validatedFields.tags.forEach((tag) => form.append("tags[]", tag));

    // Append token fields individually (since it's an object)
    // Convert the amount (number) to a string
    form.append("token[amount]", validatedFields.token.amount.toString());
    form.append("token[mintAddress]", validatedFields.token.mintAddress);

    // Append images array directly (Axios handles the array of files correctly)
    validatedFields.images.forEach((image) => {
      form.append("images", image); // This keeps all image files under one 'images' field
    });

    const { data } = await axios.post(`${process.env.API_URL}/services`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    revalidatePath(`/`);
    revalidatePath(`/services`);

    return { success: data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: { message: "Zod error" } };
    } else if (error instanceof AxiosError) {
      const data = (error as AxiosError).response?.data as ErrorRes;
      return { error: data };
    }
    return { error: { message: "An unexpected error occurred" } };
  }
};
