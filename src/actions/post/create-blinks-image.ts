"use server";

import { ErrorResponse } from "@/types/axios.types";
import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { z } from "zod";
// Function to convert base64 string to a Blob
function base64ToBlob(base64: string, mimeType: string) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export const createBlinksImage = async (details: any) => {
  const { getToken } = auth();
  const token = await getToken();
  let metadataImg;
  try {
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/og`,
        {
          type: "blinks",
          details,
        }
      );

      metadataImg = data;
    } catch (error) {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/og`,
        {
          type: "blinksusdc",
          details,
        }
      );

      metadataImg = data;
    }

    const base64Image = metadataImg.image.replace(
      /^data:image\/png;base64,/,
      ""
    );

    const imageBlob = base64ToBlob(base64Image, "image/png");
    const formData = new FormData();
    formData.append("image", imageBlob, "metadata-image.png");

    const { data } = await axios.post(
      `${process.env.API_URL}/metadata/task/${details.id}/blinks`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { success: data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: { message: "Zod error" } };
    } else if (error instanceof AxiosError) {
      const data = (error as AxiosError).response?.data as ErrorResponse;
      return { error: data };
    }
    return { error: { message: "An unexpected error occurred" } };
  }
};
