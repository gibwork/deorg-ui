"use client";
import { Icons } from "@/components/icons";
import Link from "next/link";
import React from "react";

function Header() {
  return (
    <div className="fixed top-0 left-0 right-0  z-50   ">
      <nav className="h-14 flex items-center justify-between px-4 max-w-[1540px] mx-auto">
        <div className=" flex items-center lg:gap-4">
          <Link href="/" className=" flex items-center">
            <Icons.workLogo
              width={32}
              height={32}
              className="rounded-md me-2 mt-1 dark:bg-white"
            />
            <h2 className="text-2xl  md:text-4xl font-bold tracking-tight ">
              DeOrg
            </h2>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default Header;
