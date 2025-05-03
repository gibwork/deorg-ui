"use client";
import React, { useEffect } from "react";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  useAuth,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Link from "next/link";
import { WalletButton } from "../wallet-button";
import { MobileSidebar } from "./sidebar-mobile";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import { ProfilePopover } from "../profile-popover";
import { NetworkSwitch } from "../network-switch";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { getUserData } from "@/actions/get/get-user-data";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/user.types";
import { useWallet } from "@solana/wallet-adapter-react";
import { useVerifyWallet } from "@/features/auth/lib/verify-wallet";
import { PriorityFeePopover } from "@/features/priority-fee/components/priority-fee-popover";
import { useWalletTokenBalances } from "@/hooks/use-wallet-token-balances";
import { useWalletNFTBalances } from "@/hooks/use-wallet-nft-balances";

function Header() {
  const { userId, getToken } = useAuth();
  const { onOpen } = useAuthModal();
  const { publicKey, disconnect } = useWallet();
  const { handleVerify } = useVerifyWallet();

  const { data } = useQuery<User>({
    queryKey: [`user-${userId}`],
    queryFn: async () => {
      const userData = await getUserData();
      if (userData.error) throw new Error(userData.error);
      if (userData.success) return userData.success;
    },
    enabled: !!userId,
  });

  const { data: walletTokensData } = useWalletTokenBalances({
    enabled: !!data && !!data?.walletAddress,
  });

  const { data: walletNFTData } = useWalletNFTBalances({
    enabled: !!data && !!data?.walletAddress,
  });

  // console.log(walletTokensData)

  useEffect(() => {
    if (publicKey && !data?.walletAddress) {
      handleVerify();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, data]);
  return (
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60  bg-background/95 backdrop-blur  z-50  text-black dark:text-white shadow-sm dark:shadow-zinc-800 ">
      {/* <Banner /> */}

      {/* mobile nav */}

      <nav className="lg:hidden h-14 grid grid-cols-3  place-items-center place-content-center px-3  mx-auto ">
        {userId ? (
          <div className="place-self-start flex items-center h-full w-full">
            <MobileSidebar />
          </div>
        ) : (
          <div className=" flex items-center place-self-start">
            <Link href="/" className=" flex items-center">
              <Icons.workLogo
                width={32}
                height={32}
                className="rounded-md me-2 mt-1 "
              />
              <h2 className="text-2xl  md:text-4xl font-bold tracking-tight ">
                DeOrg
              </h2>
            </Link>
          </div>
        )}
        {!userId && <div />}

        {userId && (
          <div className=" flex items-center">
            <Link href="/" className=" flex items-center">
              <Icons.workLogo
                width={32}
                height={32}
                className="rounded-md me-2 mt-1 dark:bg-white"
              />
            </Link>
          </div>
        )}
        <div className="flex items-center gap-x-3 place-self-end">
          <SignedIn>
            <PriorityFeePopover />
          </SignedIn>
          <SignedIn>
            <WalletButton />
          </SignedIn>
          <ClerkLoading>
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedIn>
              <ProfilePopover />
            </SignedIn>

            <SignedOut>
              <Button
                onClick={() => {
                  disconnect();
                  onOpen();
                }}
                size="sm"
              >
                Login
              </Button>
            </SignedOut>
          </ClerkLoaded>
        </div>
      </nav>

      {/* nav for md+ devices */}

      <nav className="hidden h-14 lg:flex items-center justify-between px-4 mx-auto b">
        <div className=" flex items-center">
          <Link href="/" className=" flex items-center">
            <Icons.workLogo
              width={32}
              height={32}
              className="rounded-md me-2 mt-1 "
            />
            <h2 className="text-2xl  md:text-4xl font-bold tracking-tight ">
              DeOrg
            </h2>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {userId && <NetworkSwitch />}

          <SignedIn>
            <PriorityFeePopover />
          </SignedIn>
          <SignedIn>
            <WalletButton />
          </SignedIn>
          <div className={cn("block lg:!hidden")}>
            <MobileSidebar />
          </div>
          <div className="hidden lg:!flex gap-x-3 ">
            <ClerkLoading>
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedIn>
                <ProfilePopover />
              </SignedIn>

              <SignedOut>
                <Button
                  onClick={() => {
                    disconnect();
                    onOpen();
                  }}
                  size="sm"
                >
                  Login
                </Button>
              </SignedOut>
            </ClerkLoaded>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;
