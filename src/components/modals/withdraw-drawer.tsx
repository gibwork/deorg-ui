"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { motion, AnimatePresence } from "framer-motion";

import { useQueryClient } from "@tanstack/react-query";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { LoaderButton } from "../loader-button";
import { useAuth } from "@clerk/nextjs";
import { User } from "@/types/user.types";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePriorityFeeLevelStore } from "@/features/priority-fee/lib/use-priority-fee-level";
import { useWalletTokenBalances } from "@/hooks/use-wallet-token-balances";
import { formatTokenAmount } from "@/utils/format-amount";
import { CircleHelp, X } from "lucide-react";
import { revalidateUserWalletBalance } from "@/actions/get/get-wallet-token-balances";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Asset } from "@/types/types.work";

const SUPPORTED_DECAF_TOKENS = [
  "So11111111111111111111111111111111111111112",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
];

function WithdrawDrawer({
  isOpen,
  setIsOpen,
  title,
  description,
  onConfirm,
  confirmText = "Withdraw Payment",
  isPending,
  handleWithdrawToDecafWallet,
  platformFee,
  asset,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  isPending: boolean;
  handleWithdrawToDecafWallet?: () => void;
  platformFee?: number;
  asset: Asset;
}) {
  const transaction = useTransactionStatus();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isOpen) return null;

  if (isDesktop)
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          className="pt-0"
          onInteractOutside={(e) => {
            if (isPending || transaction.isProcessing) {
              e.preventDefault();
            }
          }}
        >
          <SheetHeader className="bg-stone-50 dark:bg-muted dark:border-gray-700 dark:text-white -mx-6 py-2 px-3 border-t-2 border-b-2 border-stone-200">
            <SheetTitle className="font-bold">
              {title}
              <SheetClose
                disabled={isPending || transaction.isProcessing}
                className="absolute right-4 top-4 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </SheetTitle>
            {/* <SheetDescription className="!m-0 text-sm">{description}</SheetDescription> */}
          </SheetHeader>
          <WithdrawComponent
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={title}
            description={description}
            onConfirm={onConfirm}
            confirmText={confirmText}
            isPending={isPending}
            handleWithdrawToDecafWallet={handleWithdrawToDecafWallet}
            asset={asset}
            platformFee={platformFee}
          />
        </SheetContent>
      </Sheet>
    );

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setIsOpen}
      dismissible={isPending || transaction.isProcessing ? false : true}
    >
      <DrawerContent
        onInteractOutside={(e) => {
          if (isPending || transaction.isProcessing) {
            e.preventDefault();
          }
        }}
      >
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-2 sm:px-5">
          <WithdrawComponent
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={title}
            description={description}
            onConfirm={onConfirm}
            confirmText={confirmText}
            isPending={isPending}
            handleWithdrawToDecafWallet={handleWithdrawToDecafWallet}
            asset={asset}
            platformFee={platformFee}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default WithdrawDrawer;

const WithdrawComponent = ({
  isOpen,
  setIsOpen,
  title,
  description,
  onConfirm,
  confirmText = "Withdraw Payment",
  isPending,
  handleWithdrawToDecafWallet,
  platformFee = 0,
  asset,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  isPending: boolean;
  handleWithdrawToDecafWallet?: () => void;
  platformFee?: number;
  asset: Asset;
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("wallet");
  const isDecafSupported = SUPPORTED_DECAF_TOKENS.includes(asset?.mintAddress);

  const queryClient = useQueryClient();
  const transaction = useTransactionStatus();
  const { publicKey } = useWallet();
  const walletModal = useWalletModal();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const {
    selectedPriority,
    maxPriorityFee,
    exactPriorityFee,
    isPriorityFeeModeMaxCap,
  } = usePriorityFeeLevelStore();

  const userData = queryClient.getQueryData<User>([`user-${userId}`]);
  const {
    data: walletTokensData,
    error,
    isLoading: walletTokensLoading,
    refetch,
    isRefetching: isWalletTokensRefetching,
  } = useWalletTokenBalances({
    enabled: !!userData && !!userData?.walletAddress,
  });

  const solBalance = useMemo(() => {
    if (!walletTokensData) {
      return 0;
    }
    const availableSOl = walletTokensData?.find(
      (token: any) =>
        token.address == "So11111111111111111111111111111111111111112"
    );
    if (!availableSOl) return 0;

    return formatTokenAmount(
      availableSOl?.tokenInfo.balance || 0,
      availableSOl?.tokenInfo?.decimals
    );
  }, [walletTokensData]);

  const minSolRequired = useMemo(() => {
    if (asset?.mintAddress == "So11111111111111111111111111111111111111112") {
      return isPriorityFeeModeMaxCap ? maxPriorityFee : exactPriorityFee;
    }
    return (
      (platformFee ?? 0) +
      (isPriorityFeeModeMaxCap ? maxPriorityFee : exactPriorityFee)
    );
  }, [platformFee, exactPriorityFee, maxPriorityFee, isPriorityFeeModeMaxCap]);

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

  const renderAmount = () => {
    return (
      <div className="flex justify-between items-center flex-wrap gap-2">
        <p className="">Amount</p>
        <p className=" text-right">
          {formatTokenAmount(asset.amount, asset.decimals)} {asset?.symbol}
        </p>
      </div>
    );
  };

  const renderPlatormFee = (percentage: number, isDecaf: boolean) => {
    const fee = isDecaf
      ? formatTokenAmount(asset.amount, asset.decimals) * 0.08
      : platformFee;
    return (
      <div className="flex justify-between items-center flex-wrap gap-2">
        <p className="">
          Platform Fee ({percentage}%){" "}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CircleHelp className="size-4 inline-block cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>${percentage}% of deposit in USDC value</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
        <p className=" text-right ">
          {fee.toFixed(4)} {isDecaf ? asset.symbol : "SOL"}
        </p>
      </div>
    );
  };

  const renderTransactionFee = () => {
    return (
      <div className="flex justify-between items-center flex-wrap gap-2">
        <p className="">
          Max Transaction Fee{" "}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CircleHelp className="size-4 inline-block cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This is for Solana transaction fee and Priority fee</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
        <p className="text-right">
          {(isPriorityFeeModeMaxCap
            ? maxPriorityFee
            : exactPriorityFee
          ).toFixed(4)}{" "}
          SOL
        </p>
      </div>
    );
  };
  const renderReceiveAmount = (isDecaf: boolean) => {
    const fee = isDecaf
      ? formatTokenAmount(asset.amount, asset.decimals) * 0.08
      : asset.mintAddress === "So11111111111111111111111111111111111111112"
      ? platformFee
      : 0;
    const receiveAmount = formatTokenAmount(asset.amount, asset.decimals) - fee;

    return (
      <div className="flex justify-between items-center flex-wrap gap-2 font-bold text-lg ">
        <p className="text-foreground ">You Receive</p>
        <p className=" text-foreground text-right">
          <span className="flex items-center gap-2 justify-end">
            {receiveAmount.toFixed(4)} {asset?.symbol}{" "}
            <Avatar className="size-5">
              <AvatarImage src={asset?.imageUrl} alt="token" />
              <AvatarFallback className="bg-muted">?</AvatarFallback>
            </Avatar>
          </span>
        </p>
      </div>
    );
  };

  const renderPayAmount = () => {
    return (
      <div className="flex justify-between items-center flex-wrap gap-2 font-bold text-lg ">
        <p className="text-foreground ">You Pay</p>
        <p className=" text-foreground text-right">
          <span className="flex items-center gap-2 justify-end">
            {minSolRequired.toFixed(4)} SOL
            <Avatar className="size-5">
              <AvatarImage
                src={"https://cdn.gib.work/token-images/solana.png"}
                alt="token"
              />
              <AvatarFallback className="bg-muted">?</AvatarFallback>
            </Avatar>
          </span>
        </p>
      </div>
    );
  };
  // useEffect(() => {
  //   // Hide Intercom launcher
  //   update({ hide_default_launcher: true });

  //   return () => update({ hide_default_launcher: false });
  // }, []);

  return (
    <div className="space-y-5 md:mb-0 mt-5">
      <RadioGroup
        onValueChange={setSelectedPaymentMethod}
        value={selectedPaymentMethod}
        disabled={isPending || transaction.isProcessing}
      >
        <div className="border rounded-md p-3">
          <div className="flex items-start gap-2">
            <RadioGroupItem value="wallet" id="wallet" className="mt-1.5" />
            <div className="leading-4">
              <Label htmlFor="wallet" className="text-lg font-bold">
                Withdraw with Solana Wallet
              </Label>
              <p className="text-sm text-muted-foreground">
                Transfer the funds directly to your primary wallet.
              </p>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {selectedPaymentMethod === "wallet" && (
              <WithdrawContent>
                <div className="text-sm space-y-0.5 mt-5 p-2">
                  {renderAmount()}
                  {renderPlatormFee(5, false)}
                  {renderTransactionFee()}
                  <Separator className="mt-2" />
                  {renderReceiveAmount(false)}
                  <Separator className="my-0.5" />
                  {renderPayAmount()}
                </div>
              </WithdrawContent>
            )}
          </AnimatePresence>
        </div>

        {handleWithdrawToDecafWallet && (
          <div className="border rounded-md p-3">
            <div className="flex items-start gap-2">
              <RadioGroupItem
                value="decaf"
                id="decaf"
                className="mt-1.5"
                disabled={!isDecafSupported}
              />
              <div className="leading-4">
                <Label htmlFor="decaf" className="text-lg font-bold">
                  Withdraw to Fiat with Decaf
                </Label>
                {!isDecafSupported && (
                  <p className="text-muted-foreground text-sm">
                    This payment method is not available.{" "}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CircleHelp className="size-4 inline-block cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This feature is only available for USDC and SOL</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </p>
                )}
              </div>
            </div>
            <AnimatePresence initial={false}>
              {selectedPaymentMethod === "decaf" && (
                <WithdrawContent>
                  <div className="text-sm space-y-0.5 mt-5 p-2">
                    {renderAmount()}
                    {renderPlatormFee(8, true)}
                    <Separator className="mt-2" />
                    {renderReceiveAmount(true)}
                  </div>
                </WithdrawContent>
              )}
            </AnimatePresence>
          </div>
        )}
      </RadioGroup>

      {selectedPaymentMethod === "wallet" ? (
        publicKey ? (
          <div className="">
            <LoaderButton
              className="w-full"
              onClick={onConfirm}
              isLoading={transaction.isProcessing}
              disabled={
                transaction.isProcessing ||
                isPending ||
                solBalance < minSolRequired
              }
            >
              {solBalance < minSolRequired ? "Insufficient SOL" : confirmText}
            </LoaderButton>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Button
                onClick={handleRefreshWalletBalance}
                variant="link"
                disabled={loading}
                className="my-2 w-full text-center text-blue-500 "
              >
                Click here to refresh wallet balance
              </Button>
            </motion.div>
          </div>
        ) : (
          <Button
            className="w-full pb-5"
            disabled={transaction.isProcessing || isPending}
            onClick={() => {
              setIsOpen(false);
              walletModal.setVisible(true);
            }}
          >
            Connect Wallet
          </Button>
        )
      ) : null}

      {handleWithdrawToDecafWallet && selectedPaymentMethod === "decaf" && (
        <div className=" pb-5">
          {userData?.decafSolWallet ? (
            <LoaderButton
              className="w-full "
              onClick={handleWithdrawToDecafWallet}
              isLoading={isPending}
              disabled={
                isPending || transaction.isProcessing || !isDecafSupported
              }
            >
              Withdraw to Decaf Wallet
            </LoaderButton>
          ) : (
            <Link
              href={`/p/${userData?.username}/account`}
              className={cn(
                transaction.isProcessing || isPending || !isDecafSupported
                  ? "pointer-events-none opacity-50"
                  : ""
              )}
            >
              <Button
                disabled={
                  transaction.isProcessing || isPending || !isDecafSupported
                }
                onClick={() => setIsOpen(false)}
                className={cn("w-full ")}
              >
                Connect Decaf Wallet
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

const WithdrawContent = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="collapsed"
    animate="open"
    exit="collapsed"
    variants={{
      open: {
        opacity: 1,
        height: "auto",
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        },
      },
      collapsed: {
        opacity: 0,
        height: 0,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        },
      },
    }}
    style={{
      overflow: "hidden",
    }}
  >
    <motion.div
      variants={{
        open: {
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          },
        },
        collapsed: {
          y: 20,
          transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  </motion.div>
);
