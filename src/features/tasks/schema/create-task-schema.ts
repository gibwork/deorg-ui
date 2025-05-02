import { z } from "zod";

export const CreateTaskFormDataScheme = z
  .object({
    title: z
      .string()
      .min(3, {
        message: "title must be at least 3 characters.",
      })
      .max(80, {
        message: "title must not be longer than 80 characters.",
      }),
    tags: z
      .string({
        required_error: "Category is required.",
      })
      .array(),
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
    isPrivate: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    isBlinksEnabled: z.boolean().default(false),
    allowOnlyVerifiedSubmissions: z.boolean().default(false),

    // github issue
    externalUrl: z
      .string()
      .regex(new RegExp(/^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/issues\/\d+\/?$/), "Please enter a valid github issue url.")
      .optional(),
    ghBranch: z.string().optional(),

    //token restriction
    isTokenRequired: z.boolean().default(false),
    requiredTokenAddress: z.string().optional(),
    requiredTokenAmount: z.coerce
      .number({ message: "Please enter a valid token amount." })
      .min(1)
      .optional(),

    //nft restriction
    isNFTRequired: z.boolean().default(false),
    requiredNFTCollectionId: z.string().optional(),

    amount: z.coerce.number({
      message: "Please enter a valid amount",
    }),
    deadline: z.date(),
  })
  .refine((data) => !(data.isPrivate && data.isFeatured), {
    message: "Task cannot be both private and featured.",
    path: ["isPrivate", "isFeatured"],
  })
  .refine((data) => data.isTokenRequired === !!data.requiredTokenAddress, {
    message: "Token address must be provided if 'Token Required' is enabled.",
    path: ["requiredTokenAddress"],
  })
  .refine((data) => data.isNFTRequired === !!data.requiredNFTCollectionId, {
    message: "Please select an NFT Collection to continue.",
    path: ["requiredNFTCollectionId"],
  });

export type CreateTaskFormDataType = z.infer<typeof CreateTaskFormDataScheme>;
