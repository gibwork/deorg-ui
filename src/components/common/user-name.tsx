"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { User } from "@/types/user.types";
import { BadgeCheck, BadgeCheckIcon } from "lucide-react";
import { ButtonProps } from "../ui/button";
import { Icons } from "../icons";

function UserName({ user, className, ...props }: ButtonProps & { user: User }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span>{user?.firstName}</span>
      {user.isPhoneVerified || user.xAccountVerified ? (
        <button title="verified">
          <BadgeCheck className="text-background size-5 fill-theme  -ml-1" />
        </button>
      ) : null}
    </div>
  );
}

export default UserName;
