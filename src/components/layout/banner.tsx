"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMediaQuery } from "usehooks-ts";

import { Icons } from "../icons";
import { useRouter } from "next/navigation";
import React, {
  Dispatch,
  SetStateAction,
  FunctionComponent,
  useEffect,
} from "react";
import { cn } from "@/lib/utils";

interface IProps {
  setShowBanner: Dispatch<SetStateAction<boolean>>;
}

// function Banner({ setShowBanner }: IProps) {
function Banner() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showBanner, setShowBanner] = React.useState<boolean>(false);

  React.useEffect(() => {
    setShowBanner(true);
  }, []);
  return (
    <div className={cn(!showBanner && "")}>
      <AnimatePresence mode="wait">
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: isMobile ? 42 : 35 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
            className=" min-w-full  bg-theme text-gray-200"
          >
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              href="https://discord.gg/KnKvp8hsrb"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center gap-2 lg:grid lg:grid-cols-12  ">
                <p className=" lg:col-start-2 lg:col-span-10  text-center font-light py-2 w-full text-xs md:text-sm  ">
                  Gibwork is currently under active development
                  <span className="hidden xl:inline-flex pl-1">
                    {" "}
                    to bring you an even better experience
                  </span>
                  . For latest updates or to report a issue click{" "}
                  <span className="inline-flex items-center">
                    <span className="underline underline-offset-2 text-white cursor-pointer ">
                      here.
                    </span>
                    <Icons.discord className="w-4 h-4 ml-1" />
                  </span>
                </p>
                <div className="flex items-center justify-end ">
                  <button
                    className=" px-2 "
                    onClick={(e) => {
                      e.stopPropagation();
                      e.nativeEvent.preventDefault();
                      setShowBanner(false);
                    }}
                  >
                    <Icons.close className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Banner;
