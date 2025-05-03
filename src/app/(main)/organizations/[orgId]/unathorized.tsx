"use client";
import { LoaderButton } from "@/components/loader-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWalletAuth } from "@/features/auth/lib/wallet-auth";
import { AlertCircle } from "lucide-react";

export const Unauthorized = () => {
  const { isLoading, handleSignIn } = useWalletAuth();
  return (
    <div className="flex  w-full bg-gray-50 dark:bg-gray-900">
      <div className="container py-3 px-4 md:px-6">
        <div className=" flex items-center justify-center">
          <div className="max-w-md w-full space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please connect your wallet and sign in to view organization
                details.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <LoaderButton isLoading={isLoading} onClick={handleSignIn}>
                Connect Wallet
              </LoaderButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
