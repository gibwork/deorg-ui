"use client";
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ImageLoader from "@/components/image-loader";
import { cn } from "@/lib/utils";
import { Bounty, Question, Service, Task } from "@/types/types.work";
import Link from "next/link";
import { UsersParticipantList } from "@/components/user-participant-list";
import { useMemo } from "react";
import { Icons } from "@/components/icons";
import { formatTokenAmount, getFormattedAmount } from "@/utils/format-amount";
import AnimatedLabel from "./animated-label";
import DateComponent from "../date-component";

interface Props {
  item: Task | Question | Bounty;
  type: "tasks" | "questions" | "bounties";
}

const ListItemCard = ({ item, type }: Props) => {
  const amountApproved = useMemo(() => {
    let amount = 0;

    if (type === "tasks") {
      (item as Task).taskSubmissions
        ?.filter((task) => !!task.asset)
        .map((task) => {
          amount += formatTokenAmount(task.asset.amount, task.asset.decimals);
        });
    }
    return amount;

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        "md:my-1  rounded-md justify-between border-b hover:cursor-pointer",
        !item?.isOpen ? "opacity-60" : ""
      )}
    >
      <Link href={`/${type}/${item.id}`} className="w-full">
        {/* --------------*/}
        {/* mobile view */}
        {/* ---------------- */}
        <div className="flex flex-col  md:hidden py-2 ">
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-2 ">
              <Avatar className="w-8 h-8 rounded-full">
                <ImageLoader
                  src={item.user.profilePicture}
                  alt={item.user.username}
                  height={64}
                  width={64}
                  quality={50}
                />
                <AvatarFallback></AvatarFallback>
              </Avatar>
              <span>@{item.user.username}</span>
            </div>

            <div className="flex justify-end items-center gap-1 rounded-lg font-semibold">
              {/* <span className=" text-sm font-light">{`($${item.asset.price.toFixed(
                2
              )})`}</span> */}
              <span className="text-xl">
                {getFormattedAmount(
                  formatTokenAmount(item.asset.amount, item.asset.decimals),
                  2,
                  true
                )}
              </span>
              <Avatar className="w-4 h-4 opacity-85">
                <ImageLoader
                  src={item.asset.imageUrl}
                  alt={item.asset.symbol}
                  height={25}
                  width={25}
                  quality={50}
                />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  ?
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="flex items-center  justify-between text-xs  text-secondary-foreground font-normal">
            {" "}
            <div className="flex">{item?.isFeatured && <AnimatedLabel />}</div>
            {!item?.isOpen ? "CLOSED" : null}
            {item?.isOpen ? (
              amountApproved === 0 ? (
                <span className="">OPEN</span>
              ) : (
                <span className="flex gap-1 x">
                  {getFormattedAmount(amountApproved, 2, true)}{" "}
                  <span className=" ">paid</span>
                </span>
              )
            ) : null}
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-[1.2rem] leading-6 [overflow-wrap:anywhere]">
              {item.title}
            </h3>
          </div>

          <div className="flex items-center justify-between ">
            <div className="flex align-bottom items-center text-xs text-muted-foreground">
              {item.isOpen ? "ends" : "ended"}{" "}
              <DateComponent datetime={item?.deadline} type="fromDate" />
            </div>
            <UsersParticipantList
              users={
                type === "tasks"
                  ? (item as Task).taskSubmissions?.map((task) => ({
                      profilePicture: task.user?.profilePicture,
                      username: task.user?.username,
                    }))
                  : type === "bounties"
                  ? (item as Bounty).bountySubmissions?.map((sub) => ({
                      profilePicture: sub.user?.profilePicture,
                      username: sub.user?.username,
                    }))
                  : undefined
              }
            />
          </div>
        </div>

        {/* --------------*/}
        {/* md+ view */}
        {/* ---------------- */}
        <div
          className={cn(
            " hidden md:flex md:flex-row justify-between md:items-center ",
            item?.isFeatured && "pt-5"
          )}
        >
          <div className="flex md:items-center ">
            <div className="p-2 me-1 ">
              <Avatar className="w-10 h-10 sm:w-16 sm:h-16 rounded-full">
                <ImageLoader
                  src={item.user.profilePicture}
                  alt={item.user.username}
                  height={64}
                  width={64}
                  quality={50}
                />
                <AvatarFallback></AvatarFallback>
              </Avatar>
            </div>
            <div className={cn("", item?.isFeatured && "-translate-y-2.5")}>
              <div className="flex">
                {item?.isFeatured && <AnimatedLabel />}
              </div>
              <h3 className="text-2xl font-semibold text-[1.2rem] leading-6 [overflow-wrap:anywhere]">
                {item.title}
              </h3>
              <div>
                <div className="hidden sm:flex items-center gap-1 text-xs lowercase text-muted-foreground">
                  <span>{item.tags[0]}</span>

                  <Icons.dot className="size-2 fill-muted-foreground" />

                  <div className="flex items-center">
                    {item.isOpen ? "ends" : "ended"}{" "}
                    <DateComponent datetime={item?.deadline} type="fromDate" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 h-full">
            <div className="flex justify-end items-center gap-1 rounded-lg font-semibold ">
              {/* <span className=" text-sm font-light">{`($${item.asset.price.toFixed(
                2
              )})`}</span> */}
              <span className="text-xl">
                {getFormattedAmount(
                  formatTokenAmount(item.asset.amount, item.asset.decimals),
                  2,
                  true
                )}
              </span>
              <Avatar className="w-4 h-4 opacity-85">
                <ImageLoader
                  src={item.asset.imageUrl}
                  alt={item.asset.symbol}
                  height={25}
                  width={25}
                  quality={50}
                />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  ?
                </AvatarFallback>
              </Avatar>
              {!item?.isOpen && (
                <span className="text-secondary-foreground">|</span>
              )}

              {!item?.isOpen && "CLOSED"}
              {item?.isOpen ? (
                amountApproved === 0 ? (
                  <>
                    <span className="text-secondary-foreground">|</span>
                    <span className="text-secondary-foreground font-normal">
                      OPEN
                    </span>
                  </>
                ) : (
                  <span className="flex gap-1 text-secondary-foreground">
                    <span className="text-secondary-foreground">|</span>
                    {getFormattedAmount(amountApproved, 2, true)}{" "}
                    <span className="hidden md:block font-normal">paid</span>
                  </span>
                )
              ) : null}
            </div>

            <UsersParticipantList
              users={
                type === "tasks"
                  ? (item as Task).taskSubmissions?.map((task) => ({
                      profilePicture: task.user?.profilePicture,
                      username: task.user?.username,
                    }))
                  : type === "bounties"
                  ? (item as Bounty).bountySubmissions?.map((sub) => ({
                      profilePicture: sub.user?.profilePicture,
                      username: sub.user?.username,
                    }))
                  : undefined
              }
            />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListItemCard;
