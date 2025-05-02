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
import { Tally1 } from "lucide-react";
import { formatTokenAmount, getFormattedAmount } from "@/utils/format-amount";
import AnimatedLabel from "./animated-label";
import Image from "next/image";
import { Icons } from "../icons";
import UserName from "./user-name";
import UserAvatar from "./user-avatar";

interface Props {
  item: Service;
}

const ServiceItemCard = ({ item }: Props) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div className={cn("max-w-xs  ", !item?.isOpen ? "opacity-60" : "")}>
      <div className="flex flex-col">
        <Link
          href={`/services/${item.id}`}
          className="w-full "
          prefetch={false}
          // rel="noopener noreferrer"
          // target="_blank"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className=" aspect-video h-[180px]">
            <Image
              // key={index}
              src={item?.images?.[0]!}
              width={100}
              height={100}
              alt="Card Image"
              className="h-full w-full  object-cover object-center  rounded-lg"
            />
          </div>
        </Link>

        <div className="py-2.5 px-1">
          <div className="flex items-center justify-between ">
            <Link
              href={`/p/${item.user.username}`}
              className="flex items-center gap-2 "
              prefetch={false}
              rel="noopener noreferrer"
              target="_blank"
            >
              <UserAvatar user={item.user} className="w-6 h-6" />

              <UserName
                user={item.user}
                className="text-xs md:text-sm hover:underline decoration-1 underline-offset-2 font-medium"
              />
            </Link>
            <div className="flex justify-end items-center text-sm font-semibold ">
              <Icons.usdc className="h-4 w-4 mr-1" />
              {item?.totalAmountEarned.toFixed(2)} Earned
            </div>
          </div>

          <Link
            href={`/services/${item.id}`}
            className="w-full group "
            prefetch={false}
            // rel="noopener noreferrer"
            // target="_blank"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <h3
              className={cn(
                "h-[48px] text-base group-hover:underline line-clamp-2 leading-5 py-1 text-zinc-800 dark:text-zinc-300",
                isHovered ? "underline" : ""
              )}
            >
              {item.title}
            </h3>
            <div className="flex items-center justify-between gap-1 py-1 text-sm  ">
              <span className="">
                {item.requests.length > 0 ? item.requests.length : 0}{" "}
                {item.requests.length > 1 ? "Orders" : "Order"}
              </span>
              <UsersParticipantList
                users={item?.requests?.map((serviceRequest) => ({
                  profilePicture: serviceRequest.user.profilePicture,
                  username: serviceRequest.user.username,
                }))}
                type="services"
              />
            </div>
            <div className="flex items-center gap-1  font-medium">
              {/* <span className="opacity-50">Price: </span> */}
              <span className="">
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
              <span>{item.asset.symbol}</span>
              <span className="text-sm text-muted-foreground"> / request</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceItemCard;
