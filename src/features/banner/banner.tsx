"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMediaQuery } from "usehooks-ts";

import { Icons } from "@/components/icons";
import React from "react";
import { cn } from "@/lib/utils";

function Banner() {
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
            className=" min-w-full bg-theme text-stone-200 "
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
                <p className=" lg:col-start-2 lg:col-span-10  text-center font-medium py-2 w-full text-xs md:text-sm  ">
                  <span className=" md:gap-2">
                    🚀 Now Live on Devnet - Follow us on{" "}
                    <a
                      href="https://twitter.com/deorgdotxyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-white transition-colors"
                    >
                      X
                    </a>{" "}
                    for latest updates
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
