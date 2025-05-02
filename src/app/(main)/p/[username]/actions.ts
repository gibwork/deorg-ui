"use server";

import { createServerAction } from "zsa";
import z from "zod";
import { unauthenticatedAction } from "@/lib/safe-action";
import usersService from "@/services/user.service";
import badgesService from "@/services/badges.service";

export const getUserProfileDataAction = unauthenticatedAction
  .createServerAction()
  .input(
    z.object({
      username: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { success, data } = await usersService.getUserDataByName(
      input.username
    );
    if (!success) throw new Error(data.message);
    if (success) return data;
  });

export const getBadgesAction = unauthenticatedAction
  .createServerAction()
  .handler(async () => {
    const { success, data } = await badgesService.getBadges();
    if (!success) throw new Error(data.message);
    if (success) return data;
  });
