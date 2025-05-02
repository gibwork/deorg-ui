"use client";
import React, { useState } from "react";
import { User } from "@/types/user.types";
import { useUser } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight, LogInIcon, WalletIcon, XCircleIcon } from "lucide-react";
import { useAuthModal } from "@/hooks/use-auth-modal";
function DecafBanner() {
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState(true);
  const { user, isLoaded } = useUser();
  const { onOpen } = useAuthModal();
  const userData = queryClient.getQueryData<User>([`user-${user?.id}`]);

  if (!isLoaded || userData?.decafSolWallet) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className=" pb-5"
        >
          <div className="relative bg-gradient-to-r from-blue-200 to-[#B06AB3]  rounded-lg shadow font-sans p-3 lg:py-5 ">
            <div className=" flex flex-col gap-1 md:px-3 ">
              <div className="flex items-center gap-2">
                <div className="w-7 sm:w-8 md:w-10">
                  <Image
                    src="/images/decaf_logo.png"
                    width={100}
                    height={100}
                    alt=""
                  />
                </div>

                <h2 className=" lg:text-4xl text-xl sm:text-2xl md:text-3xl font-bold text-black ">
                  Decaf Wallet Now Supported!
                </h2>
              </div>
              <div className="">
                <p className="text-sm sm:text-base leading-5 text-black ">
                  Experience smoother withdrawals with our new Decaf Wallet
                  integration. Connect your Decaf account today for automatic
                  payments and manage your funds effortlessly.
                </p>

                <div className="flex items-center gap-5 mt-4">
                  <Link
                    href="https://docs.gib.work/~/changes/JTfjTbtj460WKq1xKQYb/introduction/how-it-works/decaf-integration?r=jwXeCh2dJ2FyAUCnwwt4"
                    target="_blank"
                    className={cn(
                      buttonVariants({ variant: "default", size: "sm" }),
                      "flex items-center gap-1 text-xs md:text-base dark:bg-background dark:text-gray-200"
                    )}
                  >
                    Learn More
                    <ArrowUpRight className="size-4 " />
                  </Link>
                  {user ? (
                    <Link
                      href={`/p/${user.username}/account`}
                      className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "flex items-center gap-1 text-xs md:text-base dark:bg-background dark:text-gray-200"
                      )}
                    >
                      Connect Decaf Wallet
                      <WalletIcon className="size-4 " />
                    </Link>
                  ) : (
                    <Button onClick={onOpen} size="sm">
                      Login
                      <LogInIcon className=" size-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <button
              className="absolute top-1 right-1 md:top-3 md:right-3 dark:text-background"
              onClick={() => setIsVisible(false)}
            >
              <XCircleIcon />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DecafBanner;
