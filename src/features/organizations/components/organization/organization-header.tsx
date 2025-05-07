"use client";

import { HardDrive, AlertTriangle, Plus } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Copy, ExternalLink, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useOrganization } from "../../hooks/use-organization";
import { cn, truncate } from "@/lib/utils";
import Link from "next/link";
import { SignedIn, useAuth } from "@clerk/nextjs";
import { PriorityFeePopover } from "@/features/priority-fee/components/priority-fee-popover";
import { WalletButton } from "@/components/wallet-button";
import { getUserData } from "@/actions/get/get-user-data";
import { User } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";

interface OrganizationHeaderProps {
  organization: {
    name: string;
    description: string;
    members: number;
    contributors: number;
    balance: number;
    multisigAddress: string;
  };
}

export function OrganizationHeader({
  organizationId,
}: {
  organizationId: string;
}) {
  const { userId, getToken } = useAuth();

  const {
    data: organization,
    isLoading,
    error,
  } = useOrganization(organizationId);

  const handleCopyMultisigAddress = () => {
    try {
      navigator.clipboard.writeText("5xT...");
      toast.success("Multisig address copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy multisig address");
    }
  };

  return (
    <div className="space-y-4 ">
      <div className="flex flex-col md:flex-row md:items-start justify-end gap-4">
        {/* <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={organization?.logoUrl}
                  alt={organization?.name}
                />
                <AvatarFallback>
                  {organization?.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <h1 className="text-3xl font-bold tracking-tight">
                {organization.name}
              </h1>
            </div>
            <p className="text-muted-foreground">{organization.description}</p>
          </div> */}

        <div className="flex items-center gap-3">
          {/* <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
            <Button variant="default" size="sm">
              Fund Treasury
            </Button> */}
          <Link
            href={`/organizations/${organizationId}/proposals/new
              `}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "flex items-center gap-2"
            )}
          >
            <Plus className="h-4 w-4" />
            New Proposal
          </Link>
          <PriorityFeePopover />
          <WalletButton />
        </div>
      </div>

      {/* <div className=" flex flex-wrap gap-4 pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Multisig:
            </span>
            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
              {truncate(organization.multisigWallet, 6, 4)}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopyMultisigAddress}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Link
              href={`https://explorer.solana.com/address/${organization.multisigWallet}?cluster=devnet`}
              target="_blank"
            >
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="rounded-sm">
                {organization.members.length} Members
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="rounded-sm">
                {organization.members.length} Contributors
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="rounded-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              >
                {organization.token?.amount} {organization.token?.symbol}
              </Badge>
            </div>
          </div>
        </div> */}
    </div>
  );
}
