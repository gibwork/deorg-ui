"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { User } from "@/types/user.types";
import { ButtonProps } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import ImageLoader from "../image-loader";

function UserAvatar({
  user,
  className,
  ...props
}: ButtonProps & { user: User }) {
  return (
    <Avatar className={cn("w-8 h-8 rounded-full", className)}>
      <ImageLoader
        src={user?.profilePicture}
        alt={user?.username}
        height={100}
        width={100}
        quality={80}
      />
      <AvatarFallback></AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
