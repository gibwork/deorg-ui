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
import Image from "next/image";
import { useOrganization } from "../../hooks/use-organization";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function OrganizationAssets({ orgId }: { orgId: string }) {
  const { data: organization } = useOrganization(orgId);

  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedToken, setSelectedToken] = useState("sol");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assets</h2>
          <p className="text-muted-foreground">
            Manage your organization&apos;s digital assets and tokens.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDepositDialog(true)}
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Deposit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSendDialog(true)}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Send
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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
            <div className="text-2xl font-bold">
              {organization?.treasuryBalances.length}
            </div>
          </CardContent>
        </Card>

        {/* <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">NFT Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Across 2 collections
                </p>
              </CardContent>
            </Card> */}
      </div>

      <Tabs defaultValue="tokens" className="w-full">
        <TabsList>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          {/* <TabsTrigger value="nfts">NFTs</TabsTrigger> */}
          {/* <TabsTrigger value="transactions">Transactions</TabsTrigger> */}
        </TabsList>

        <TabsContent value="tokens" className="space-y-4 mt-6">
          <div className="rounded-md border">
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

          {/* <div className="flex justify-center">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Token
            </Button>
          </div> */}
        </TabsContent>

        {/* <TabsContent value="nfts" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts.map((nft, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={nft.image || "/placeholder.svg"}
                    alt={nft.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{nft.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {nft.collection}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </CardFooter>
              </Card>
            ))}

            <Card className="border-dashed flex flex-col items-center justify-center aspect-square">
              <CardContent className="flex flex-col items-center justify-center h-full">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Add NFT</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent> */}

        <TabsContent value="transactions" className="mt-6">
          <div className="rounded-md border">
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
        </TabsContent>
      </Tabs>

      {/* Deposit Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Assets</DialogTitle>
            <DialogDescription>
              Deposit tokens to your organization&apos;s wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="token">Select Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sol">SOL</SelectItem>
                  <SelectItem value="usdc">USDC</SelectItem>
                  <SelectItem value="bonk">BONK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Deposit Address</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
              <code className="text-xs break-all">FoXx...zDyj</code>
              <div className="mt-2 text-xs text-muted-foreground">
                Send only {selectedToken.toUpperCase()} to this address. Sending
                other tokens may result in permanent loss.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDepositDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Assets</DialogTitle>
            <DialogDescription>
              Send tokens from your organization&apos;s wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="token">Select Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sol">SOL</SelectItem>
                  <SelectItem value="usdc">USDC</SelectItem>
                  <SelectItem value="bonk">BONK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter wallet address or .sol domain"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="p-4 bg-muted rounded-md text-xs text-muted-foreground">
              <p>
                Transaction will require approval from at least 2 members before
                it can be executed.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button>Create Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
