import { z } from "zod";

export const EditTaskFormDataScheme = z.object({
  content: z
    .string()
    .max(10000, {
      message: "content must not be longer than 10000 characters.",
    })
    .min(4, {
      message: "content must be at least 4 characters.",
    }),
  requirements: z
    .string()
    .max(1000, {
      message: "requirements must not be longer than 1000 characters.",
    })
    .min(4, {
      message: "requirements must be at least 4 characters.",
    }),
});

export type EditTaskFormDataType = z.infer<typeof EditTaskFormDataScheme>;
