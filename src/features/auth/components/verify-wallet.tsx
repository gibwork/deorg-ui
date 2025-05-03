"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { User } from "@/types/user.types";
import { WalletMinimalIcon } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { verifyPrimaryWallet } from "@/actions/post/verify-primary-wallet";
import { toast } from "sonner";
import { LoaderButton } from "@/components/loader-button";
import { Input } from "@/components/ui/input";
type CardProps = React.ComponentProps<typeof Card>;

const VerifyWallet = ({ className, ...props }: CardProps) => {
  const queryClient = useQueryClient();
  const walletModal = useWalletModal();
  const { user } = useUser();
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const userData = queryClient.getQueryData<User>([`user-${user?.id}`]);

  const handleVerifyWallet = async () => {
    if (isLoading) {
      setIsLoading(false);
      return;
    }
    if (!connected || !publicKey || !signMessage) {
      walletModal.setVisible(true);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const message = `Please sign this message to verify your identity: ${publicKey}`;

      const data = new TextEncoder().encode(message);
      const signature = await signMessage(data);

      toast.loading("verifying wallet...");
      const { success, error } = await verifyPrimaryWallet(
        publicKey.toString(),
        btoa(String.fromCharCode(...signature))
      );

      if (error) {
        setError(error.message);
        throw new Error(error.message);
      }
      await queryClient.invalidateQueries({
        queryKey: [`user-${user?.id}`],
      });
      toast.success(success);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      toast.dismiss();
      setIsLoading(false);
    }
  };
  return (
    <Card
      className={cn(
        "max-w-[880px] shadow-none md:shadow border-none",
        className
      )}
      {...props}
    >
      <CardHeader className="!px-5">
        <CardTitle>Primary Wallet</CardTitle>
        <CardDescription>
          {!userData?.walletAddress
            ? `To continue using your account with our new wallet authentication,
          please link your primary Solana wallet here.This will allow you to
          sign in effortlessly using your wallet and access all features
          securely.`
            : `Your primary wallet is connected! You can now use wallet sign-in seamlessly.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          {userData?.walletAddress ? (
            <div>
              <Input
                readOnly
                value={userData.walletAddress}
                className="max-w-lg text-muted-foreground bg-stone-50 dark:bg-border opacity-90"
              />
              <p className="text-xs sm:text-sm text-muted-foreground p-1">
                If you wish to change your primary wallet, please contact
                support.
              </p>
            </div>
          ) : (
            <div>
              <LoaderButton
                className=""
                variant="outline"
                onClick={handleVerifyWallet}
                isLoading={isLoading}
              >
                {publicKey ? "Verify Wallet" : "Connect Wallet"}{" "}
                <WalletMinimalIcon className="size-4 ml-1" />
              </LoaderButton>

              {error && (
                <p className="text-red-500 text-xs md:text-sm p-1">{error}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerifyWallet;
