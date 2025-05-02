"use client";

import ImageLoader from "@/components/image-loader";
import { useUser } from "@clerk/nextjs";

import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React from "react";

import Link from "next/link";
import { PencilIcon, UserRoundCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { User } from "@/types/user.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

export const ProfilePage = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { username: profileUsername } = useParams<{ username: string }>();

  const userData = queryClient.getQueryData([
    "getUserData",
    `${profileUsername}`,
  ]) as User;

  let userIsInEarningPercentage = `${userData?.percentRank}%`;

  let usdcAmountUserHasEarned = "$0.00";
  let usdcAmountUserHasSpent = "$0.00";
  if (userData?.totalAmountEarned && !isNaN(userData?.totalAmountEarned)) {
    usdcAmountUserHasEarned = "$" + userData?.totalAmountEarned.toFixed(2);
  }

  if (userData?.totalAmountSpent && !isNaN(userData?.totalAmountSpent)) {
    usdcAmountUserHasSpent = "$" + userData?.totalAmountSpent.toFixed(2);
  }

  if (userData)
    return (
      <section className=" sm:mx-6 p-5 mb-32">
        <div className="flex flex-col md:flex-row md:justify-between  gap-4">
          <div className="flex gap-4">
            <div className=" flex shrink-0 overflow-hidden rounded-full w-20 h-20 md:w-32 md:h-32 ">
              <Avatar className="aspect-square h-full w-full">
                <ImageLoader
                  src={userData.profilePicture}
                  alt={userData.username}
                  height={100}
                  width={100}
                  quality={100}
                />
                <AvatarFallback></AvatarFallback>
              </Avatar>
            </div>

            <p className="flex flex-col font-semibold text-xl md:text-3xl mt-2">
              <span className=" capitalize">
                {userData?.firstName} {userData?.lastName}
              </span>
              <span className="text-muted-foreground text-base md:text-lg">
                @{userData?.username}
              </span>
            </p>
          </div>
          {user && user.username === profileUsername ? (
            <div className="">
              <Link
                href={`/p/${userData?.username}/account`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "md:text-xl "
                )}
              >
                <UserRoundCog className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="text-base text-zinc-800 dark:text-zinc-200 ">
                  Edit Profile
                </span>
              </Link>
            </div>
          ) : null}
        </div>

        <div className=" grid  md:grid-cols-3 lg:grid-cols-8 gap-5 w-full p-3 mt-8">
          <div className="lg:col-span-2  rounded-lg ">
            <span className="font-semibold rounded-md px-2"></span>
            <div className="space-y-5 bg-gray-50 p-2 dark:bg-zinc-900 mt-2">
              <div className="">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-normal"> Earned</p>{" "}
                  <span className="flex items-center gap-2 text-xl font-semibold">
                    <Icons.usdc className=" rounded-full w-7 h-7"/>
                    {usdcAmountUserHasEarned}
                  </span>
                </div>
                <p className=" text-xs text-muted-foreground">
                  {userData?.percentRank === null ? (
                    "No Work, No ranking"
                  ) : userData?.percentRank === 100 ? (
                    <>
                      Top{" "}
                      <span className="font-bold opacity-100">
                      Worker!
                      </span>{" "}
                        Rank{" "}
                      <span className="font-bold opacity-100">
                        #1
                      </span>
                    </>
                  ) : (
                    <>
                      Above{" "}
                      <span className="font-bold opacity-100">
                        {userIsInEarningPercentage}
                      </span>{" "}
                      of people
                    </>
                  )}
                </p>
              </div>
              <div className="">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-normal"> Spent</p>{" "}
                  <span className="flex items-center gap-2 text-xl font-semibold">
                    <Icons.usdc className=" rounded-full w-7 h-7"/>
                    {usdcAmountUserHasSpent}
                  </span>
                </div>
                <p className="hidden text-xs text-muted-foreground">
                  Above{" "}
                  <span className="font-bold opacity-100">
                    {userIsInEarningPercentage}
                  </span>{" "}
                  of people
                </p>
              </div>
            </div>
            {/* <h3 className="text-xl font-medium p-2">Achievements</h3>
            {badges &&
              badges.length > 0 &&
              badges.map((badge) => (
                <AcheivementBadge key={badge.id} badge={badge} />
              ))} */}
          </div>
          <div className="lg:col-span-6 w-full">
            <div className="flex ">
              <span className="font-semibold rounded-md px-2">
                PROOF OF WORK
              </span>
              <span className="font-semibold px-2 mx-2 opacity-50 ">
                ACTIVITY
              </span>
            </div>
            <div className="flex mt-2 p-4 bg-stone-50 dark:bg-zinc-900 w-full h-[20rem] text-stone-400">
              soon
            </div>
          </div>
        </div>
      </section>
    );
};
