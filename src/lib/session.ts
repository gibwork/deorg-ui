import "server-only";

import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { AuthenticationError } from "@/services/error.service";

export const getCurrentUser = cache(async () => {
  const user = await currentUser();
  if (!user) {
    return undefined;
  }
  return user;
});

export const assertAuthenticated = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError();
  }
  return user;
};
