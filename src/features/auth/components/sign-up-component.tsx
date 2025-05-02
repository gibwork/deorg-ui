"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

import SignUpWithGoogleButton from "../components/signup-with-google-button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Mail, MoveRight, WalletIcon } from "lucide-react";
import { SignUp, useUser } from "@clerk/nextjs";
import { useWalletAuth } from "../lib/wallet-auth";
import LoaderDots from "@/components/loader-dots";

interface ComponentProps {
  toggleSignup: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignUpComponent = ({ toggleSignup }: ComponentProps) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { isLoading, error, handleSignIn } = useWalletAuth();
  const [isSignupWithEmailSelected, toggleSignupWithEmail] =
    useState<boolean>(false);
  const [isHovered, setHovered] = useState<boolean>(false);

  return (
    <div className="w-full ">
      {isSignupWithEmailSelected ? (
        <div className="flex flex-col grow h-full ">
          <div>
            <Button
              onClick={() => toggleSignupWithEmail(false)}
              className="!p-0 flex items-center gap-2"
              variant="ghost"
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
          </div>
          <div className="grid text-center">
            <h1 className="text-2xl font-semibold ">Continue with Email</h1>
          </div>

          <div className=" max-w-xs ">
            {isLoaded && isSignedIn ? (
              <p>Welcome!</p>
            ) : (
              <SignUp
                routing="virtual"
                appearance={{
                  layout: {
                    showOptionalFields: false,
                  },
                  elements: {
                    card: "p-1 shadow-none max-w-xs",
                    cardBox: "shadow-none max-w-xs",
                    footer: "hidden",
                    header: "hidden",
                    socialButtons: "hidden",
                    dividerRow: "hidden",
                    formFieldInput: "h-[45px] 2xl:text-lg focus:shadow-none",
                    formButtonPrimary:
                      " bg-theme hover:bg-theme/90 2xl:text-lg  dark:text-white font-semibold",
                    formField__phoneNumber: "hidden",
                    formFieldAction__emailAddress: "hidden",
                  },
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className=" hidden md:invisible">
            <Button
              onClick={() => toggleSignupWithEmail(false)}
              className="!p-0 flex items-center gap-2"
              variant="ghost"
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
          </div>
          <div
            className={cn(
              "grid text-center",
              isLoading ? "pointer-events-none" : ""
            )}
          >
            <h1 className="text-2xl font-bold ">Create a new account</h1>
            <p className=" text-muted-foreground">
              Already have an account?{" "}
              <Button
                onClick={() => toggleSignup(false)}
                className="!p-0 underline underline-offset-4"
                variant="link"
              >
                Sign in
              </Button>
            </p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-5 w-full">
              <LoaderDots />
            </div>
          ) : (
            <div className="grid gap-3 mt-5">
              <SignUpWithGoogleButton title="Continue with Google" />
              <motion.div
                onHoverStart={(e) => setHovered(true)}
                onHoverEnd={(e) => setHovered(false)}
              >
                <Button
                  onClick={() => toggleSignupWithEmail(true)}
                  variant="outline"
                  type="button"
                  className="w-full flex items-center justify-center"
                >
                  {" "}
                  <span className="flex grow items-center justify-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Continue with Email
                  </span>
                  <span className="w-5 h-5">
                    <MoveRight
                      className={cn(
                        "transition-all duration-300 ease-in-out text-gray-500",
                        isHovered ? "w-5 h-5" : "w-0 h-5"
                      )}
                    />
                  </span>
                </Button>
              </motion.div>

              <div className="flex flex-row items-center space-x-2 py-2">
                <div className="h-[1px] grow bg-gray-200 dark:bg-zinc-800"></div>
                <div className="text-sm text-muted-foreground">or</div>
                <div className="h-[1px] grow bg-gray-200 dark:bg-zinc-800"></div>
              </div>

              <Button variant="outline" onClick={handleSignIn}>
                <WalletIcon className="size-4 mr-2" />
                Sign up with wallet
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignUpComponent;
