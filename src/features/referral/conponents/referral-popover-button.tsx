"use client";
import { buttonVariants } from "@/components/ui/button";

import { User } from "@/types/user.types";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ReferralPopoverButton({ userData }: { userData?: User }) {
  if (userData)
    return (
      <Link
        href="/referral"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "text-sm h-7 md:h-9 flex items-center !p-1 md:!px-4 md:gap-2"
        )}
      >
        <span className="hidden md:block">
          Referrals: {userData?.totalReferrals}
        </span>
      </Link>
    );
}
