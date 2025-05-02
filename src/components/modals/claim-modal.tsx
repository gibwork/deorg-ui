"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SelectWallet from "./select-wallet";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { Transaction } from "@solana/web3.js";
import {
  confirmWithdrawTransaction,
  withdrawToken,
} from "@/actions/post/withdraw";
import { useClaimModal } from "@/hooks/use-claim-modal";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bounty, Question } from "@/types/types.work";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import { cn, getDisplayDecimalAmountFromAsset } from "@/lib/utils";
import { getTokenBalance } from "@/lib/web3-util";
import { getBounty } from "@/actions/get/get-bounty";
import { useAuth } from "@clerk/nextjs";
import ImageLoader from "../image-loader";
import { useWithdrawPaymentModal } from "@/hooks/use-withdraw-payment-modal";
import useNetwork from "@/hooks/use-network";
import { usePriorityFeeLevelStore } from "@/features/priority-fee/lib/use-priority-fee-level";
const minimum_sol_transaction_fee = 0.005;

function ClaimModal() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { userId } = useAuth();
  const transaction = useTransactionStatus();
  const { bountyId } = useParams<{ bountyId: string }>();
  const { select, wallets, publicKey, disconnect, signTransaction } =
    useWallet();
  const { isOpen, claimType, claimId, onClose } = useClaimModal();
  const network = useNetwork((state) => state.network);
  const {
    selectedPriority,
    maxPriorityFee,
    exactPriorityFee,
    isPriorityFeeModeMaxCap,
  } = usePriorityFeeLevelStore();
  const {
    data: bounty,
    error,
    isLoading,
  } = useQuery({
    queryKey: [`bounties-${bountyId}`],
    queryFn: async () => {
      const bounty = await getBounty(bountyId);
      if (bounty.error) throw new Error(bounty.error);
      if (bounty.success) return bounty.success;
    },
    enabled: !!bountyId && claimType === "bounties",
  });

  if (!claimType || !claimId) return null;

  const claimItem =
    claimType === "questions" || claimType == "tasks"
      ? (queryClient.getQueryData([`${claimType}-${claimId}`]) as Question)
      : bounty;

  const claimTaskSubmission =
    claimType === "questions"
      ? claimItem.answers?.find(
          (answer: any) => answer.user.externalId == userId
        )
      : claimItem?.taskSubmissions?.find(
          (submission: any) => submission?.user?.externalId == userId
        );

  async function withdrawClaim() {
    if (!publicKey || !signTransaction) return;

    const withdrawPayload = {
      payer: publicKey.toString(),
      strategy: "blockhash",
      network,
      priorityFeeLevel: selectedPriority,
      maxPriorityFee: isPriorityFeeModeMaxCap ? maxPriorityFee : null,
      priorityFee: !isPriorityFeeModeMaxCap ? exactPriorityFee : null,
    };

    const withdrawCreateResponse = await withdrawToken(
      withdrawPayload,
      claimId!,
      claimType!
    );

    if (withdrawCreateResponse.error) {
      throw new Error(withdrawCreateResponse.error.message);
    }
    const retreivedTx = Transaction.from(
      Buffer.from(
        withdrawCreateResponse.success.serializedTransaction,
        "base64"
      )
    );

    const serializedTx = await signTransaction(retreivedTx);

    const confirmTxPayload = {
      transactionId: withdrawCreateResponse.success.transactionId,
      serializedTransaction: serializedTx?.serialize().toString("base64"),
    };

    const transactionResponse = await confirmWithdrawTransaction(
      confirmTxPayload,
      claimId!,
      claimType!
    );

    if (transactionResponse.error) {
      throw new Error(transactionResponse.error.message);
    }
  }

  const handleTransaction = async () => {
    transaction.onStart();
    // const solbalance = await getTokenBalance(publicKey!.toBase58(), network);
    // if (solbalance < minimum_sol_transaction_fee) {
    //   transaction.onEnd();
    //   return toast.warning(
    //     "Not enough SOL for transaction. Please add SOL to your wallet."
    //   );
    // }
    try {
      await withdrawClaim();
      await queryClient.invalidateQueries({
        queryKey: [`${claimType}-${claimId}`],
      });
      toast.success("Work Claimed!");
      router.push(`/${claimType}/${claimId}`);
      onClose();
    } catch (error) {
      toast.error("Oops!", {
        description: (error as Error).message,
      });
    } finally {
      transaction.onEnd();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className=""
      >
        {!publicKey ? (
          <SelectWallet />
        ) : (
          <>
            {isLoading ? (
              <>loading...</>
            ) : (
              <div className="p-2">
                Congratulations 🎉! Your submission has been approved.
                You&apos;re eligible to withdraw your payment now.
                <div className="flex items-center justify-center py-3 gap-1 px-2 rounded-lg ">
                  <span className="text-xl font-medium ">
                    {claimTaskSubmission
                      ? getDisplayDecimalAmountFromAsset(
                          claimTaskSubmission.asset.amount,
                          claimTaskSubmission.asset.decimals
                        ).toFixed(3)
                      : getDisplayDecimalAmountFromAsset(
                          claimItem.asset.amount,
                          claimItem.asset.decimals
                        ).toFixed(3)}
                  </span>
                  <Avatar className="w-4 h-4">
                    <ImageLoader
                      src={claimItem.asset.imageUrl}
                      alt={claimItem.asset.symbol}
                      height={80}
                      width={80}
                      quality={50}
                    />
                    <AvatarFallback className="bg-muted">?</AvatarFallback>
                  </Avatar>
                  <span className="uppercase">{claimItem.asset.symbol}</span>
                </div>
                <Button
                  variant="default"
                  onClick={handleTransaction}
                  className="w-full flex items-center"
                  disabled={transaction.isProcessing}
                >
                  <LoaderCircle
                    className={cn(
                      "w-4 h-4 mr-2",
                      transaction.isProcessing ? "animate-spin" : "hidden"
                    )}
                  />
                  Claim
                </Button>
                <p className="text-sm p-1 italic">
                  Please ensure you have the minimum required amount in your
                  wallet to cover the transaction fees.
                </p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ClaimModal;
