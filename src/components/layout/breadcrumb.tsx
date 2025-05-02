"use client";

import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export type BreadCrumbType = {
  title: string;
  link: string;
};

type BreadCrumbPropsType = {
  items: BreadCrumbType[];
};

export default function BreadCrumb({ items }: BreadCrumbPropsType) {
  return (
    <div className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href={"/"}
        className={cn(
          "overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground !p-0 hover:text-black dark:hover:text-white"
        )}
      >
        Home
      </Link>
      {items?.map((item: BreadCrumbType, index: number) => (
        <React.Fragment key={item.title}>
          <ChevronRightIcon className="h-4 w-4" />
          <Link
            href={`${item.link}`}
            className={cn(
              "font-medium !p-0 hover:text-black dark:hover:text-white  truncate max-w-40 md:max-w-md lg:max-w-xl",

              index === items?.length - 1
                ? "text-foreground pointer-events-none"
                : "text-muted-foreground"
            )}
          >
            {item.title}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}
