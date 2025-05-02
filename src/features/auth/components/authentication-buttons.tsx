"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import UserRegistrationModal from "../../../components/modals/user-registration-modal";
import { Button } from "../../../components/ui/button";
import UserSignInModal from "../../../components/modals/sign-in-user-modal";
import { useAuth, useSignUp, useUser } from "@clerk/nextjs";
import { useUserSignInModal } from "@/hooks/use-sign-in-modal";
import { useUserRegistrationModal } from "@/hooks/use-registration-modall";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import SignUpWithGoogleButton from "./signup-with-google-button";
import { useWalletModal, WalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletAuth } from "../lib/wallet-auth";
import { LoadingModal } from "../modals/loading-modal";

export const AuthenticationButtons = () => {
  const { isLoaded } = useAuth();
  const userSignInModal = useUserSignInModal();

  const userRegistrationModal = useUserRegistrationModal();

  useEffect(() => {
    if (window.location.hash == "#/continue") {
      userRegistrationModal.onOpen();
    }

    // es-lint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center mx-2">
        <Button
          variant={"theme"}
          className="text-white text-lg font-semibold mt-5"
          onClick={() => userRegistrationModal.onOpen()}
        >
          Sign up
        </Button>
        <span
          className={cn(
            "w-60",
            `text-center text-xs text-muted-foreground p-2 font-light`
          )}
        >
          {" "}
          By registering, you confirm that you accept our{" "}
          <Link
            href="https://legal.gib.work/privacy-policy.pdf"
            prefetch={false}
            rel="noopener noreferrer"
            target="_blank"
            className={" text-blue-400 cursor-pointer "}
          >
            Privacy Policy.
          </Link>
        </span>
        <UserRegistrationModal />

        <div className="flex flex-row items-center space-x-2 py-2">
          <div className="h-[1px] grow bg-gray-200 dark:bg-zinc-800"></div>
          <div className="text-sm text-muted-foreground">or</div>
          <div className="h-[1px] grow bg-gray-200 dark:bg-zinc-800"></div>
        </div>

        <SignUpWithGoogleButton title="Sign in with Google" />
        <div className="mx-auto">
          <Button
            variant="link"
            className="text-sm w-fit text-blue-500 text-center "
            onClick={() => userSignInModal.onOpen()}
          >
            Sign in with e-mail
          </Button>
        </div>

        <UserSignInModal />
      </div>
    </>
  );
};
