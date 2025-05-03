"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { truncate } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { Copy, UnplugIcon, WalletMinimalIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { Icons } from "./icons";
import { toast } from "sonner";
import useNetwork from "@/hooks/use-network";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/user.types";
import { useWalletChange } from "@/features/auth/lib/use-wallet-change";
import { verifyPrimaryWallet } from "@/actions/post/verify-primary-wallet";
import { useVerifyWallet } from "@/features/auth/lib/verify-wallet";
import { WalletButtonPopover } from "./wallet-button-popover";

export function WalletButton({ userData }: { userData?: User }) {
  const { isManualChange, toggleManualChange, isVerifying, toggleVerifying } =
    useWalletChange();
  const { userId, signOut } = useAuth();
  const {
    publicKey,
    signMessage,
    connected,
    disconnect,
    disconnecting,
    wallet,
  } = useWallet();
  const walletModal = useWalletModal();
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true);
  useEffect(() => {
    if (publicKey && userData?.primaryWallet) {
      const pubKey = publicKey.toString();
      if (pubKey !== userData?.primaryWallet) {
        disconnect();
        if (!isManualChange) {
          signOut({ redirectUrl: "/" });
        } else {
          toast.warning("Please connect your primary wallet to continue!", {
            id: pubKey,
          });
        }
      }
      toggleManualChange(false);
    } else if (!publicKey && userData?.primaryWallet && !isFirstRender) {
      if (!isManualChange) {
        signOut({ redirectUrl: "/" });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, userData, disconnecting]);

  useEffect(() => {
    if (publicKey) {
      setIsFirstRender(false);
    }
  }, [publicKey]);

  if (!publicKey) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-sm h-7 md:h-9 flex items-center !p-1 md:!px-4 md:gap-2"
        onClick={() => {
          toggleManualChange(true);
          toggleVerifying(true);
          walletModal.setVisible(true);
        }}
        // disabled={isLoading}
      >
        <WalletMinimalIcon className="p-1" />
        <span className="hidden md:block">
          {" "}
          {/* {isLoading ? "Connecting..." : "Connect"} */}
          Connect
        </span>
      </Button>
    );
  }

  return <WalletButtonPopover userData={userData} />;
}
