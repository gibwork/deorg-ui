"use client";

import React, { useEffect, useState } from "react";
import { useVouchDrawer } from "@/hooks/use-vouch-drawer";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { useMediaQuery } from "usehooks-ts";
import { X, Star, Check } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { createPendingVouch } from "@/actions/post/create-pending-vouch";
import { confirmVouch } from "@/actions/post/confirm-vouch";
import { Transaction } from "@solana/web3.js";
import { useQueryClient } from "@tanstack/react-query";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { LoaderButton } from "@/components/loader-button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tipAmounts = [
  { value: "1", label: "$1" },
  { value: "7", label: "$7" },
  { value: "15", label: "$15" },
  { value: "100", label: "$100" },
];

export function VouchDrawer() {
  const { isOpen, profileUser, onClose } = useVouchDrawer();
  const transaction = useTransactionStatus();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className={cn(
          "pt-0",
          isDesktop
            ? "w-[400px] sm:max-w-[540px]"
            : "w-full h-[80vh] sm:max-w-full"
        )}
        side={isDesktop ? "right" : "bottom"}
        onInteractOutside={(e) => {
          if (transaction.isProcessing) {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader className="bg-stone-50 dark:bg-muted dark:border-gray-700 dark:text-white -mx-6 py-2 px-3 border-t-2 border-b-2 border-stone-200">
          <SheetTitle className="font-bold relative">
            Leave a Vouch
            <SheetClose
              disabled={transaction.isProcessing}
              className="absolute right-1 top-0 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetTitle>
        </SheetHeader>
        <div className="px-2 py-2 overflow-y-auto">
          <VouchContent profileUser={profileUser} onClose={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Star Rating Selection Component
function StarRatingSelector({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none"
          onClick={() => setRating(star)}
        >
          <Star
            size={24}
            className={cn(
              "transition-colors cursor-pointer",
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 hover:text-yellow-200 dark:text-gray-600"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// Success View Component
const VouchSuccessView = ({
  vouchData,
  onShare,
  onClose,
}: {
  vouchData: {
    content: string;
    rating: number;
    tipAmount: string;
    profileUser: any;
  };
  onShare: () => void;
  onClose: () => void;
}) => {
  return (
    <div className="space-y-5 text-center py-6">
      <div className="mx-auto rounded-full bg-green-100 dark:bg-green-900/30 p-3 w-16 h-16 flex items-center justify-center">
        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>

      <h3 className="text-xl font-bold">Vouch Sent Successfully!</h3>
      <p className="text-muted-foreground text-sm">
        Your vouch for {vouchData.profileUser.username} has been submitted.
      </p>

      <div className="pt-4 space-y-3">
        <Button
          onClick={onShare}
          className="w-full bg-[#1DA1F2] hover:bg-[#1a94da] text-white"
        >
          <Icons.x className="mr-2 h-4 w-4" />
          Share on X
        </Button>

        <Button variant="outline" onClick={onClose} className="w-full">
          Maybe Later
        </Button>
      </div>
    </div>
  );
};

const VouchContent = ({
  profileUser,
  onClose,
}: {
  profileUser: any;
  onClose: () => void;
}) => {
  const transaction = useTransactionStatus();
  const { publicKey } = useWallet();
  const walletModal = useWalletModal();
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const [tipAmount, setTipAmount] = useState("1"); // Default to $1
  const [rating, setRating] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [vouchData, setVouchData] = useState<any>(null);
  const [pendingVouch, setPendingVouch] = useState<any>(null);
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "creating" | "signing" | "confirming"
  >("idle");
  const { signTransaction } = useWallet();

  // Check if user is trying to vouch for themselves
  const isSelfVouch = user?.id === profileUser?.id;

  // Check if user has verified X account
  const hasVerifiedXAccount = !!user?.externalAccounts?.some(
    (account) =>
      account.provider === "x" && account.verification?.status === "verified"
  );

  // Generate tweet content for sharing
  const generateTweetContent = (vouchData: any) => {
    // Create a truncated version of the vouch content (for tweet)
    const truncatedContent =
      vouchData.content.length > 100
        ? vouchData.content.substring(0, 97) + "..."
        : vouchData.content;

    const xAccountUsername =
      vouchData?.profileUser?.xAccount ?? vouchData?.profileUser?.username;

    // Format the tweet text
    const tweetText = `I just vouched for @${xAccountUsername} on Gibwork! "${truncatedContent}"`;

    // Add hashtags
    const hashtags = "Gibwork,Vouch";

    // Build the URL with parameters
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&hashtags=${encodeURIComponent(hashtags)}`;
  };

  // Function to handle sharing on X/Twitter
  const handleShare = () => {
    if (!vouchData) return;

    const tweetUrl = generateTweetContent(vouchData);

    // Use the same popup function that's used for X authorization
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;

    const width =
      window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

    const height =
      window.innerHeight ??
      document.documentElement.clientHeight ??
      screen.height;

    const systemZoom = width / window.screen.availWidth;

    const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
    const top = (height - 550) / 2 / systemZoom + dualScreenTop;

    window.open(
      tweetUrl,
      "Share on X",
      `width=${500 / systemZoom},height=${
        550 / systemZoom
      },top=${top},left=${left}`
    );

    onClose(); // Close the drawer after sharing
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      return toast.error("Please enter a message");
    }

    if (message.trim().length < 10) {
      return toast.error("Your message must be at least 10 characters");
    }

    if (!rating) {
      return toast.error("Please select a rating");
    }

    if (!publicKey) {
      return toast.error("Please connect your wallet");
    }

    if (isSelfVouch) {
      return toast.error("You cannot vouch for yourself");
    }

    if (!hasVerifiedXAccount) {
      return toast.error(
        "You must verify your X account in Settings to vouch for others"
      );
    }

    if (!signTransaction) {
      return toast.error("Wallet does not support transaction signing");
    }

    transaction.onStart();

    try {
      // Step 1: Create a pending vouch and get transaction instructions
      setTransactionStatus("creating");
      const pendingResult = await createPendingVouch({
        content: message,
        rating: rating,
        tipAmount: parseFloat(tipAmount),
        userId: profileUser.id,
      });

      if (pendingResult.error) {
        throw new Error(
          pendingResult.error.message || "Failed to create pending vouch"
        );
      }

      const { vouch, serializedTransaction } = pendingResult.success;
      setPendingVouch(vouch);

      // Step 2: Deserialize and sign the transaction
      setTransactionStatus("signing");
      const transaction = Transaction.from(
        Buffer.from(serializedTransaction, "base64")
      );

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      if (!signedTransaction) {
        throw new Error("Failed to sign transaction");
      }

      // Serialize the signed transaction to base64
      const serializedSignedTransaction = signedTransaction
        ?.serialize()
        .toString("base64");

      // Step 3: Confirm the transaction
      setTransactionStatus("confirming");

      // Send the signed transaction to the backend for execution
      const confirmResult = await confirmVouch(
        {
          signedTransaction: serializedSignedTransaction,
          vouchId: vouch.id,
        },
        profileUser.id
      );

      if (confirmResult.error) {
        throw new Error(
          confirmResult.error.message || "Failed to confirm vouch"
        );
      }

      // Invalidate the user query to refresh the vouches
      queryClient.invalidateQueries({
        queryKey: [`user-${profileUser.username}`],
      });

      toast.success("Vouch sent successfully!");

      // Store the vouch data and show success view
      setVouchData({
        content: message,
        rating: rating,
        tipAmount: tipAmount,
        profileUser: profileUser,
      });
      setIsSuccess(true);
      setTransactionStatus("idle");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send vouch"
      );
      console.error(error);
      setTransactionStatus("idle");
    } finally {
      transaction.onEnd();
    }
  };

  useEffect(() => {
    const body = document.body;

    if (walletModal.visible) {
      body.style.pointerEvents = "auto";
    }

    return () => {
      body.style.pointerEvents = "";
    };
  }, [walletModal]);

  // If success state is true, show the success view
  if (isSuccess && vouchData) {
    return (
      <VouchSuccessView
        vouchData={vouchData}
        onShare={handleShare}
        onClose={onClose}
      />
    );
  }

  // Otherwise show the form
  return (
    <div className="space-y-5 md:mb-0 mt-5">
      <div className="mb-4">
        <Label htmlFor="rating" className="text-lg font-bold block mb-2">
          Rating
        </Label>
        <div className="flex items-center justify-between mb-2 p-2 border rounded-md">
          <span className="text-sm">How was their work?</span>
          <StarRatingSelector rating={rating} setRating={setRating} />
        </div>
      </div>

      <div className="mb-4">
        <Textarea
          id="message"
          placeholder="Write your vouch message here (minimum 10 characters)..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(
            "min-h-[120px]",
            message.length > 0 && message.length < 10 ? "border-red-500" : ""
          )}
          disabled={transaction.isProcessing}
        />
        <div className="flex justify-between mt-1 text-xs">
          <span
            className={
              message.length > 0 && message.length < 10
                ? "text-red-500"
                : "text-muted-foreground"
            }
          >
            {message.length} / 10 characters minimum
          </span>
          {message.length > 0 && message.length < 10 && (
            <span className="text-red-500">
              {10 - message.length} more characters needed
            </span>
          )}
        </div>
      </div>

      <div className="rounded-md">
        <Label className="text-lg font-bold block mb-2">Tip Amount</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {tipAmounts.map((amount) => (
            <Card
              key={amount.value}
              className={cn(
                "cursor-pointer transition-all border-2 hover:bg-violet-100 hover:border-violet-800",
                tipAmount === amount.value
                  ? "border-violet-800 bg-violet-100 dark:text-black"
                  : "border-border "
              )}
              onClick={() => setTipAmount(amount.value)}
            >
              <CardContent className="p-2 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-1">
                  <Icons.usdc className="w-4 h-4 mr-1" />
                  <span className="font-bold text-lg">{amount.label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {isLoaded ? (
        user ? (
          isSelfVouch ? (
            <div className="text-center p-2 mb-2 border rounded-md bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <p className="text-amber-800 dark:text-amber-300 text-sm">
                You cannot vouch for yourself
              </p>
            </div>
          ) : !hasVerifiedXAccount ? (
            <div className="space-y-3">
              <div className="text-center p-2 mb-2 border rounded-md bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  You must verify your X account to vouch for others
                </p>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  onClose();
                  window.location.href = `/p/${user.username}/account`;
                }}
              >
                Go to Settings
              </Button>
            </div>
          ) : publicKey ? (
            <LoaderButton
              className="w-full"
              onClick={handleSubmit}
              isLoading={transaction.isProcessing}
              disabled={
                transaction.isProcessing ||
                !message.trim() ||
                message.trim().length < 10 ||
                isSelfVouch ||
                !hasVerifiedXAccount
              }
            >
              {transaction.isProcessing ? "Sending..." : "Send Vouch"}
            </LoaderButton>
          ) : (
            <Button
              className="w-full"
              disabled={transaction.isProcessing}
              onClick={() => {
                walletModal.setVisible(true);
              }}
            >
              Connect Wallet
            </Button>
          )
        ) : (
          <Button
            className="w-full"
            disabled={transaction.isProcessing}
            onClick={() => {
              onClose();
              window.location.href = "/sign-in";
            }}
          >
            Log In to Continue
          </Button>
        )
      ) : (
        <Button className="w-full" disabled>
          Loading...
        </Button>
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
