"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { NavItem } from "@/types/types.sidebar";
import { ClerkLoading, useUser } from "@clerk/nextjs";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { Sparkles } from "lucide-react";

interface SidebarNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

export function SidebarNavItems({ items, setOpen }: SidebarNavProps) {
  const path = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();
  if (!items?.length) {
    return null;
  }

  return (
    <nav className="grid items-start mt-0">
      <ClerkLoading>
        <Skeleton />
      </ClerkLoading>
      {user && (
        <Link
          href={`/p/${user.username}`}
          className=" mt-1"
          onClick={() => {
            if (setOpen) setOpen(false);
          }}
        >
          <span
            className={cn(
              "group rounded-lg text-[1rem] font-medium flex items-center px-3 py-3 hover:bg-accent hover:text-accent-foreground duration-300 ease-in-out",
              path.startsWith("/p/")
                ? "bg-accent font-semibold"
                : "transparent text-muted-foreground"
            )}
          >
            <Icons.profile className="mr-2 h-4 w-4 " />
            <span className="text-[1rem] ">Profile</span>
          </span>
        </Link>
      )}
      {items.map((item, index) => {
        const Icon = Icons[item.icon || "arrowRight"];
        return (
          item.href && (
            <Link
              key={index}
              href={`${item.href}`}
              className=" my-1 "
              onClick={() => {
                if (setOpen) setOpen(false);
              }}
            >
              <span
                className={cn(
                  "group rounded-lg text-[1rem] font-medium flex items-center px-3 py-3 hover:bg-accent hover:text-accent-foreground duration-300 ease-in-out",
                  path === item.href
                    ? "bg-accent font-semibold"
                    : "transparent text-muted-foreground",
                  item.disabled && "cursor-not-allowed opacity-80"
                )}
              >
                <Icon className=" h-4 w-4 mr-2   " />
                <span>{item.title}</span>
                {item.new && (
                  <div className="flex items-center ml-2">
                    <Badge
                      variant="default"
                      className="new-badge text-xs bg-gradient-to-r from-purple-500 to-purple-700 text-white"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      NEW
                    </Badge>
                  </div>
                )}
              </span>
            </Link>
          )
        );
      })}
    </nav>
  );
}
