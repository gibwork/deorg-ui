"use client";
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  useDebounceCallback,
  useDebounceValue,
  useMediaQuery,
} from "usehooks-ts";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  BadgeCheckIcon,
  CheckIcon,
  CopyIcon,
  RefreshCcw,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Icons } from "../icons";
import { cn, getSupportedTokens, truncate } from "@/lib/utils";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getTokens, searchToken } from "@/actions/get/get-tokens";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  getUserSPLTokenBalances,
  revalidateUserWalletBalance,
} from "@/actions/get/get-wallet-token-balances";
import { formatTokenAmount } from "@/utils/format-amount";
import { ScrollArea } from "../ui/scroll-area";
import { useWalletTokenBalances } from "@/hooks/use-wallet-token-balances";
function SelectTokenModal({
  isOpen,
  setIsOpen,
  title,
  description,
  setPaymentDetails,
  isService,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  description: string;
  setPaymentDetails: React.Dispatch<
    React.SetStateAction<{
      amount: number;
      symbol: string;
      imgURL: string;
      mintAddress: string;
    }>
  >;
  isService?: boolean;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className=" min-h-[75%] max-h-[80%] flex flex-col justify-start max-w-sm sm:max-w-lg ">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="relative">
          <SelectTokenComponent
            setIsOpen={setIsOpen}
            setPaymentDetails={setPaymentDetails}
            title={title}
            isService={isService}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SelectTokenModal;

export function SelectTokenComponent({
  setIsOpen,
  setPaymentDetails,
  title,
  isService,
}: {
  setIsOpen: (open: boolean) => void;
  setPaymentDetails: React.Dispatch<
    React.SetStateAction<{
      amount: number;
      symbol: string;
      imgURL: string;
      mintAddress: string;
    }>
  >;
  title: string;
  isService?: boolean;
}) {
  const queryClient = useQueryClient();
  const loadMoreRef = React.useRef(null);
  const tokens = getSupportedTokens();
  const [searchParam, setSearchParam] = useDebounceValue("", 300);
  const { publicKey, wallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const {
    data: walletTokensData,
    error: walletTokensDataError,
    isLoading: walletTokensLoading,
    isRefetching: isWalletTokensRefetching,
  } = useWalletTokenBalances();

  const {
    data: searchResults,
    error: searchError,
    isLoading: searchLoading,
  } = useQuery({
    queryKey: ["searchTokenList", `${searchParam}`],
    queryFn: async ({ queryKey }) => {
      const searchKey = queryKey[1];
      if (searchKey) {
        const tokens = await searchToken(searchKey!);
        if (tokens.error) throw new Error(tokens.error);
        return tokens.success.results;
      }
    },
    enabled: !!searchParam,
  });

  const handleRefreshWalletBalance = async () => {
    setLoading(true);
    try {
      const { success, error } = await revalidateUserWalletBalance();
      if (error) throw new Error(error);

      await queryClient.invalidateQueries({
        queryKey: ["userTokenList"],
      });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Command
      // shouldFilter={false}
      className="fixed bottom-0  py-1 max-w-xs sm:max-w-md "
    >
      <div className="flex items-center  gap-2">
        <h2 className="text-lg font-semibold py-2">{title}</h2>
        {publicKey && (
          <Button
            variant="outline"
            size="sm"
            title="Refresh Tokens"
            onClick={handleRefreshWalletBalance}
          >
            {loading ? (
              <Icons.spinner className="size-4 animate-spin inline-block" />
            ) : (
              <RefreshCw className="size-4" />
            )}
          </Button>
        )}
      </div>
      <CommandInput
        placeholder="Search token or paste address"
        className="h-9 w-full "
        // onValueChange={(value) => setSearchParam(value)}
      />
      {isService && (
        <div className=" space-y-2 p-2">
          <span className="text-sm text-muted-foreground">Popular tokens</span>
          <div className="flex items-center gap-5 ">
            {tokens.slice(1, 3).map((token) => (
              <Button
                variant="secondary"
                type="button"
                key={token.mintAddress}
                onClick={() => {
                  if (walletTokensData) {
                    const walletToken = walletTokensData.find(
                      (t: any) => t.address == token?.mintAddress
                    );

                    if (!walletToken) {
                      setPaymentDetails({
                        amount: 0,
                        symbol: token.symbol,
                        imgURL: token.imgUrl,
                        mintAddress: token.mintAddress,
                      });
                    } else {
                      setPaymentDetails({
                        symbol: token.symbol,
                        imgURL: token.imgUrl,
                        mintAddress: token.mintAddress,
                        amount: formatTokenAmount(
                          walletToken.tokenInfo.balance,
                          walletToken.tokenInfo.decimals
                        ),
                      });
                    }
                  }
                  setIsOpen(false);
                }}
                className="flex gap-1 items-center !h-8 !px-2"
              >
                <Avatar className="w-4 h-4 ">
                  <AvatarImage src={token!.imgUrl} alt="token" />
                  <AvatarFallback className="bg-muted">?</AvatarFallback>
                </Avatar>
                {token.symbol}
              </Button>
            ))}
          </div>
        </div>
      )}
      <CommandList className=" ">
        {searchLoading || walletTokensLoading ? (
          <div className="space-y-1">
            <div className="flex items-start justify-between w-full ">
              <Skeleton className="w-full  h-10" />
            </div>
            <div className="flex items-start justify-between w-full ">
              <Skeleton className="w-full  h-10" />
            </div>
            <div className="flex items-start justify-between w-full ">
              <Skeleton className="w-full  h-10" />
            </div>
            <div className="flex items-start justify-between w-full ">
              <Skeleton className="w-full  h-10" />
            </div>
          </div>
        ) : searchError || walletTokensDataError ? (
          <CommandEmpty>No token found.</CommandEmpty>
        ) : null}

        <CommandGroup className="">
          {publicKey &&
            walletTokensData?.map((token: any) => (
              <CommandItem
                key={token.address}
                onSelect={() => {
                  setPaymentDetails({
                    amount: formatTokenAmount(
                      token.tokenInfo.balance,
                      token.tokenInfo.decimals
                    ),
                    symbol: token.symbol,
                    imgURL: token?.logoURI?.includes("cf-ipfs.com")
                      ? token?.logoURI?.replace("cf-ipfs.com", "ipfs.io")
                      : token?.logoURI,
                    mintAddress: token.address,
                  });
                  setIsOpen(false);
                }}
                className="flex items-start justify-between w-full cursor-pointer"
              >
                <div className="flex gap-2">
                  <Avatar className="w-7 h-7 ">
                    <AvatarImage
                      src={
                        token?.logoURI?.includes("cf-ipfs.com")
                          ? token?.logoURI?.replace("cf-ipfs.com", "ipfs.io")
                          : token.logoURI
                      }
                      alt="token"
                    />

                    <AvatarFallback className="bg-muted"></AvatarFallback>
                  </Avatar>
                  <p className="flex flex-col">
                    <span className="flex items-center gap-2">
                      {token?.symbol ?? "Unknown Token"}
                      {/* {token?.tags?.includes("verified") && (
                           <button className="" title="verified">
                             <BadgeCheckIcon className="text-theme size-4" />
                           </button>
                         )} */}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {token?.name ?? "Metadata not found"}
                    </span>
                  </p>
                </div>
                <div className="flex grow justify-end ">
                  <p className="flex flex-col ">
                    <span className="text-sm self-end text-muted-foreground">
                      {formatTokenAmount(
                        token.tokenInfo.balance,
                        token.tokenInfo.decimals
                      )}
                    </span>
                    <span className="text-xs self-end text-muted-foreground">
                      {truncate(token.address, 8, 4)}
                    </span>
                  </p>
                </div>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

interface TokenType {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  daily_volume: number;
  freeze_authority?: string;
  mint_authority?: string;
  exactMatchScore: number;
}
