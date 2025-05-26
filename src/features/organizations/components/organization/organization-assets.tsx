"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useOrganization } from "../../hooks/use-organization";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DepositModal } from "../modals/deposit-modal";
import { SendModal } from "../modals/send-modal";

export default function OrganizationAssets({ orgId }: { orgId: string }) {
  const { data: organization, isLoading } = useOrganization(orgId);

  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  const transactions = [
    {
      type: "receive",
      amount: "0.5 SOL",
      from: "alice.sol",
      to: "organization.sol",
      date: "2023-05-01",
      status: "completed",
      txHash: "5UBq...j7Yk",
    },
    {
      type: "send",
      amount: "100 USDC",
      from: "organization.sol",
      to: "bob.sol",
      date: "2023-04-28",
      status: "completed",
      txHash: "7YTr...k9Pl",
    },
    {
      type: "receive",
      amount: "250 BONK",
      from: "charlie.sol",
      to: "organization.sol",
      date: "2023-04-25",
      status: "completed",
      txHash: "3ZXq...m2Nj",
    },
  ];

  if (isLoading) {
    return <OrganizationAssetsSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0 pb-32">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Assets
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your organization&apos;s digital assets and tokens.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDepositDialog(true)}
              className="flex-1 sm:w-auto sm:flex-none"
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Deposit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSendDialog(true)}
              className="flex-1 sm:w-auto sm:flex-none"
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Send
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex sm:flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <Button variant="outline" size="sm" className="sm:hidden">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              $
              {(organization?.treasuryBalances.reduce(
                (acc, token) => acc + Number(token.raw),
                0
              ) || 0) / Math.pow(10, 6)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Token Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {organization?.treasuryBalances.length}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future NFT count */}
        <Card className="hidden lg:block">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-muted-foreground">
              --
            </div>
            <p className="text-xs text-muted-foreground">NFT Support</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="w-auto">
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          {/* <TabsTrigger value="nfts">NFTs</TabsTrigger> */}
          {/* <TabsTrigger value="transactions">Transactions</TabsTrigger> */}
        </TabsList>

        <TabsContent value="tokens" className="space-y-4 mt-4 sm:mt-6">
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
            <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground border-b">
              <div className="col-span-5">Asset</div>
              <div className="col-span-3 text-right">Balance</div>
              <div className="col-span-3 text-right">Value (USD)</div>
              <div className="col-span-1"></div>
            </div>

            {organization?.treasuryBalances.map((token) => (
              <div
                key={token.tokenAccount}
                className="grid grid-cols-12 p-4 items-center border-b last:border-0"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <Image
                    src={token?.token?.logoURI || "/images/usdc-icon.png"}
                    alt={token?.token?.name || "Token"}
                    className="w-8 h-8 rounded-full"
                    width={32}
                    height={32}
                  />
                  <div>
                    <div className="font-medium">{token.token.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {token.token.symbol}
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-right font-medium">
                  {token.ui}
                </div>
                <div className="col-span-3 text-right font-medium">
                  ${token.ui}
                </div>
                <div className="col-span-1 flex justify-end">
                  <Link
                    href={`https://explorer.solana.com/address/${token.tokenAccount}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-8 w-8 p-0"
                    )}
                    title="View on Explorer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View on Explorer</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Compact View */}
          <div className="md:hidden space-y-2">
            {organization?.treasuryBalances.map((token) => (
              <div
                key={token.tokenAccount}
                className="flex items-center justify-between p-3 bg-card border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Image
                    src={token?.token?.logoURI || "/images/usdc-icon.png"}
                    alt={token?.token?.name || "Token"}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    width={32}
                    height={32}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {token.token.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {token.token.symbol}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-medium text-sm">{token.ui}</div>
                    <div className="text-xs text-muted-foreground">
                      ${token.ui}
                    </div>
                  </div>
                  <Link
                    href={`https://explorer.solana.com/address/${token.tokenAccount}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-8 w-8 p-0"
                    )}
                    title="View on Explorer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View on Explorer</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {organization?.treasuryBalances.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center border rounded-lg">
              <div className="text-muted-foreground mb-2">No tokens found</div>
              <p className="text-sm text-muted-foreground">
                Deposit tokens to get started
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="mt-4 sm:mt-6">
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
            <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground border-b">
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-3">From/To</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Tx Hash</div>
            </div>

            {transactions.map((tx, index) => (
              <div
                key={index}
                className="grid grid-cols-12 p-4 items-center border-b last:border-0"
              >
                <div className="col-span-2">
                  <Badge
                    variant={tx.type === "receive" ? "secondary" : "default"}
                  >
                    {tx.type === "receive" ? "Receive" : "Send"}
                  </Badge>
                </div>
                <div className="col-span-2 font-medium">{tx.amount}</div>
                <div className="col-span-3 text-sm">
                  {tx.type === "receive" ? (
                    <div>
                      <div className="text-muted-foreground">From</div>
                      <div>{tx.from}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-muted-foreground">To</div>
                      <div>{tx.to}</div>
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-sm">{tx.date}</div>
                <div className="col-span-2">
                  <Badge variant="outline" className="capitalize">
                    {tx.status}
                  </Badge>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <span className="text-xs truncate">{tx.txHash}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Compact View for Transactions */}
          <div className="md:hidden space-y-2">
            {transactions.map((tx, index) => (
              <div key={index} className="p-3 bg-card border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={tx.type === "receive" ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {tx.type === "receive" ? "Receive" : "Send"}
                  </Badge>
                  <Badge variant="outline" className="capitalize text-xs">
                    {tx.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{tx.amount}</span>
                  <span className="text-xs text-muted-foreground">
                    {tx.date}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate">
                    {tx.type === "receive" ? `From ${tx.from}` : `To ${tx.to}`}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {tx.txHash}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Deposit Dialog */}
      {showDepositDialog && (
        <DepositModal
          isOpen={showDepositDialog}
          onClose={() => setShowDepositDialog(false)}
          organization={organization!}
        />
      )}

      {/* Send Dialog */}
      {showSendDialog && (
        <SendModal
          isOpen={showSendDialog}
          onClose={() => setShowSendDialog(false)}
          organization={organization!}
        />
      )}
    </div>
  );
}

// Skeleton Loading Component
export function OrganizationAssetsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
          <Skeleton className="h-4 w-64 sm:w-80" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 sm:w-20 sm:flex-none" />
            <Skeleton className="h-9 flex-1 sm:w-16 sm:flex-none" />
            <Skeleton className="h-9 w-20 hidden sm:block" />
          </div>
          <Skeleton className="h-9 w-full sm:hidden" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 sm:h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full sm:w-32" />

        {/* Desktop Table Skeleton */}
        <div className="hidden md:block rounded-md border">
          <div className="grid grid-cols-12 p-4 border-b">
            <div className="col-span-5">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="col-span-3 flex justify-end">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="col-span-3 flex justify-end">
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="col-span-1"></div>
          </div>

          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-12 p-4 items-center border-b last:border-0"
            >
              <div className="col-span-5 flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <div className="col-span-3 flex justify-end">
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="col-span-3 flex justify-end">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="col-span-1 flex justify-end">
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Compact Skeleton */}
        <div className="md:hidden space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-card border rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
