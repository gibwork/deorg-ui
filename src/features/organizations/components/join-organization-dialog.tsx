"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Organization } from "@/types/types.organization";
import { formatTokenAmount } from "@/utils/format-amount";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWalletTokenBalances } from "@/hooks/use-wallet-token-balances";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/user.types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { joinOrganization } from "../actions/join-organization";
import { LoaderButton } from "@/components/loader-button";

interface JoinOrganizationDialogProps {
  organization: Organization;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function JoinOrganizationDialog({
  organization,
  isOpen,
  onOpenChange,
  onSuccess,
}: JoinOrganizationDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoaded } = useUser();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const joinOrgMutaion = useMutation({
    mutationFn: joinOrganization,
    onSuccess: (data) => {
      console.log(data.success);
      toast.success("You have successfully joined the organization.");
      onOpenChange(false);
      onSuccess();
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message);
    },
  });

  const handleJoin = async () => {
    joinOrgMutaion.mutate(organization.accountAddress);
  };

  const userData = queryClient.getQueryData<User>([`user-${user?.id}`]);

  const {
    data: walletTokensData,
    isLoading: walletTokensLoading,
    isRefetching: isWalletTokensRefetching,
    refetch: walletTokenRefetch,
  } = useWalletTokenBalances({
    enabled: !!userData && !!userData?.walletAddress,
  });

  const isTokenRestricted = useMemo(() => {
    if (!organization?.token) return false;

    const isTokenAvailable = walletTokensData?.find(
      (wtd) =>
        wtd.address === organization?.token?.mintAddress &&
        formatTokenAmount(wtd.tokenInfo.balance, wtd.tokenInfo.decimals) >=
          organization.token.amount
    );

    return !isTokenAvailable;
  }, [walletTokensData, organization?.token]);

  const getTokenStatusMessage = () => {
    if (!organization?.token) return null;

    if (walletTokensLoading || isWalletTokensRefetching) {
      return "Checking token balance...";
    }

    if (!userData?.walletAddress) {
      return "Please connect your wallet to join this organization.";
    }

    if (isTokenRestricted) {
      return `You need at least ${organization.token.amount} ${organization.token.symbol} to join this organization.`;
    }

    return null;
  };

  const tokenStatusMessage = getTokenStatusMessage();
  const isJoinDisabled =
    joinOrgMutaion.isPending ||
    isTokenRestricted ||
    !userData?.walletAddress ||
    walletTokensLoading;

  const Content = () => (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold line-clamp-2 max-w-xs sm:max-w-sm">
            Join {organization.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to join this organization?
          </p>
        </div>
        {organization.token && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={organization.token.imageUrl}
                  alt={organization.token.symbol}
                />
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{organization.token.symbol}</p>
                <p className="text-sm text-muted-foreground">
                  Required: {organization.token.amount}
                </p>
              </div>
            </div>
            {tokenStatusMessage && (
              <Alert
                variant={isTokenRestricted ? "destructive" : "default"}
                className="mb-4"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  {tokenStatusMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        <div className="flex flex-col gap-3 mt-4">
          <LoaderButton
            onClick={handleJoin}
            disabled={isJoinDisabled}
            variant={isTokenRestricted ? "secondary" : "default"}
            className="w-full"
            size="lg"
            isLoading={joinOrgMutaion.isPending}
          >
            {joinOrgMutaion.isPending ? "Joining..." : "Join Organization"}
          </LoaderButton>
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm p-6">
            <Content />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Content />
      </DialogContent>
    </Dialog>
  );
}
