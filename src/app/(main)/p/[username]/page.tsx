import React from "react";
import { getQueryClient } from "@/components/providers/query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUserData, getUserDataByName } from "@/actions/get/get-user-data";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Metadata, ResolvingMetadata } from "next";
import usersService from "@/services/user.service";
import { ProfilePage } from "./_components/profile-page";

type Props = {
  params: {
    username: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const username = params.username;
  const vouch = Object.keys(searchParams).includes("vouch");
  const vouchUrlParam = vouch ? "&vouch=true" : "";

  const profile = await getUserDataByName(username);

  return {
    title: `${profile?.success?.firstName} | DeOrg`,
    description: `@${profile?.success?.username}`,
    openGraph: {
      siteName: "Gib.work",
      locale: "en_US",
      url: new URL(
        `/p/${profile?.success?.username}`,
        `${process.env.NEXT_PUBLIC_APP_URL}`
      ),
      images: [
        {
          type: "image/png",
          width: 1200,
          height: 630,
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/og?t=profile&id=${username}${vouchUrlParam}`,
        },
      ],

      type: "website",
    },
  };
}

async function page({ params }: { params: { username: string } }) {
  const queryClient = getQueryClient();
  const { userId } = auth();

  if (!userId) {
    await queryClient.prefetchQuery({
      queryKey: [`getUserData`, `${params.username}`],
      queryFn: async () => {
        const user = await usersService.getUserDataByName(params.username);
        if (!user.success) throw new Error(user.data.message);
        if (user.success) return user.data;
      },
    });
  } else {
    const currUser = await currentUser();

    params.username === currUser?.username
      ? await queryClient.prefetchQuery({
          queryKey: [`getUserData`, `${params.username}`],
          queryFn: async () => {
            const user = await usersService.getUserData();

            if (!user.success) throw new Error(user.data.message);
            if (user.success) return user.data;
          },
        })
      : await queryClient.prefetchQuery({
          queryKey: [`getUserData`, `${params.username}`],
          queryFn: async () => {
            const user = await usersService.getUserDataByName(params.username);
            if (!user.success) throw new Error(user.data.message);
            if (user.success) return user.data;
          },
        });
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScrollArea className="h-full">
        <ProfilePage />
      </ScrollArea>
    </HydrationBoundary>
  );
}

export default page;
