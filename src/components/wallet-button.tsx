"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, truncate } from "@/lib/utils";
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
import { WalletButtonPopover } from "./wallet-button-popover";
import { useUserData } from "@/hooks/use-user-data";
import { ButtonProps } from "@/components/ui/button";

export function WalletButton({
  className,
  variant = "outline",
  size = "sm",
  ...props
}: ButtonProps) {
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

  const { data: userData } = useUserData();

  const [isFirstRender, setIsFirstRender] = useState<boolean>(true);
  useEffect(() => {
    if (!userData) return; // Don't do anything if userData is not loaded yet

    if (publicKey && userData?.walletAddress) {
      const pubKey = publicKey.toString();
      if (pubKey !== userData?.walletAddress) {
        disconnect();
        if (!isManualChange) {
          signOut();
        } else {
          toast.warning("Please connect wallet to continue!", {
            id: pubKey,
          });
        }
      }
      toggleManualChange(false);
    } else if (!publicKey && userData?.walletAddress && !isFirstRender) {
      if (!isManualChange) {
        signOut();
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
        variant={variant}
        size={size}
        className={cn(
          "text-sm h-7 md:h-9 flex items-center !p-1 md:!px-4 md:gap-2",
          className
        )}
        onClick={() => {
          toggleManualChange(true);
          toggleVerifying(true);
          walletModal.setVisible(true);
        }}
        {...props}
      >
        <WalletMinimalIcon className="p-1" />
        <span className="hidden md:block">Connect Wallet</span>
      </Button>
    );
  }

  return <WalletButtonPopover userData={userData} />;
}
