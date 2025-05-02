"use client";

import { LoaderButton } from "@/components/loader-button";
import { Button } from "@/components/ui/button";
import { useWalletAuth } from "@/features/auth/lib/wallet-auth";
import { WalletIcon } from "lucide-react";

export default function HomePage() {
  const { isLoading, handleSignIn } = useWalletAuth();
  return (
    <div className="flex flex-col items-center mt-10 h-screen">
      <LoaderButton
        isLoading={isLoading}
        variant="outline"
        onClick={handleSignIn}
      >
        <WalletIcon className="size-4 mr-2" />
        Sign in with wallet
      </LoaderButton>
    </div>
  );
}
