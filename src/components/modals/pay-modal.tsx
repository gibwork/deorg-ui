"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePayModal } from "@/hooks/use-pay-modal";
import { useWallet } from "@solana/wallet-adapter-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SelectWallet from "./select-wallet";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { getTokenBalance } from "@/lib/web3-util";
import {
  getPlaceholder,
  getSupportedTokens,
  validateMinimumAmount,
} from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import { Icons } from "../icons";

import useNetwork from "@/hooks/use-network";
interface TokenMetadata {
  symbol: string;
  imgUrl: string;
  mintAddress: string;
  decimals: number;
}

type PayModalProps = {
  formref: any;
  setTxDetails: React.Dispatch<
    React.SetStateAction<{ mintAddress: string; amount: string }>
  >;
  paymentDetails: {
    amount: string;
    mintAddress: string;
  };
};

function PayModal({ formref, setTxDetails, paymentDetails }: PayModalProps) {
  const payModal = usePayModal();
  const transaction = useTransactionStatus();
  const { publicKey } = useWallet();
  const network = useNetwork((state) => state.network);

  const [minAmountError, setMinAmountError] = useState<string>("");

  const tokenMetadata: TokenMetadata[] = getSupportedTokens();
  const solTokenMetadata = tokenMetadata.find((w) => w.symbol == "SOL");

  const selectedToken = tokenMetadata.find(
    (w) => w.mintAddress == paymentDetails.mintAddress
  );

  function updatePaymentDetails(payment: any) {
    setTxDetails(payment);
  }

  const handleTransaction = async () => {
    if (!publicKey) throw Error("User must connect wallet!");
    const isError = validateMinimumAmount(
      paymentDetails.amount,
      selectedToken?.symbol!
    );
    if (isError) {
      setMinAmountError(isError.error);
      return toast.error(isError.error);
    }
    const minimumSolTransactionFee = 0.005;
    transaction.onStart();
    if (paymentDetails.mintAddress !== solTokenMetadata?.mintAddress) {
      let balance = await getTokenBalance(publicKey?.toBase58(), network);
      if (balance < minimumSolTransactionFee) {
        transaction.onEnd();
        setMinAmountError("You don't have sufficient balance.");
        return toast.error("You don't have sufficient balance.");
      }

      let decimals = tokenMetadata.find(
        (w) => w.mintAddress == paymentDetails.mintAddress
      )?.decimals;
      balance = await getTokenBalance(
        publicKey?.toBase58(),
        network,
        paymentDetails.mintAddress,
        decimals
      );
      if (balance! < Number(paymentDetails.amount)) {
        transaction.onEnd();
        setMinAmountError("You don't have sufficient balance.");
        return toast.error("You don't have sufficient balance.");
      }
    } else {
      const balance = await getTokenBalance(publicKey?.toBase58(), network);
      if (balance < Number(paymentDetails.amount) + minimumSolTransactionFee) {
        transaction.onEnd();
        setMinAmountError("You don't have sufficient balance.");
        return toast.error("You don't have sufficient balance.");
      }
    }

    if (formref.current) {
      formref.current.dispatchEvent(new Event("submit", { bubbles: true }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only numbers and upto two decimals
    const regex = /^\d*\.?\d{0,2}$/;

    if (regex.test(value)) {
      updatePaymentDetails({
        ...paymentDetails,
        amount: value,
      });
    }
  };

  return (
    <Dialog open={payModal.isOpen} onOpenChange={payModal.onClose}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-md"
      >
        {!publicKey ? (
          <SelectWallet />
        ) : (
          <>
            <h3 className="text-lg font-bold">Create Work</h3>

            <div className="pt-10 text-center ">You are paying</div>
            <div className="flex items-center justify-center ">
              <input
                disabled={transaction.isProcessing}
                type="text"
                className="outline-none bg-background w-40 max-w-xs text-center text-2xl mr-5 font-medium border-b-2"
                placeholder={getPlaceholder(selectedToken?.symbol!)}
                value={paymentDetails.amount}
                onChange={handleAmountChange}
                onClick={() => setMinAmountError("")}
              />

              <Avatar className="w-7 h-7 ">
                <AvatarImage src={selectedToken!.imgUrl} alt="token" />

                <AvatarFallback className="bg-muted">?</AvatarFallback>
              </Avatar>
              <select
                className="focus:outline-none hover:cursor-pointer text-lg p-1 bg-background"
                disabled={transaction.isProcessing}
                onChange={(e) => {
                  const token =
                    tokenMetadata.find(
                      (token) => token.symbol === e.target.value
                    ) || tokenMetadata[0];
                  updatePaymentDetails({
                    ...paymentDetails,
                    mintAddress: token?.mintAddress,
                  });
                }}
              >
                <option value={selectedToken?.symbol}>
                  {selectedToken?.symbol}
                </option>
                {tokenMetadata
                  .filter(
                    (token) => token.mintAddress != selectedToken?.mintAddress
                  )
                  .map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
              </select>
            </div>

            <p className="text-center">for successfully completing this task</p>

            {minAmountError && (
              <span className="text-center text-red-500 text-sm">
                {minAmountError}
              </span>
            )}

            <div className="mt-5 ">
              {transaction.isProcessing ? (
                <Button
                  disabled
                  type="button"
                  className="w-full flex items-center font-medium  "
                >
                  <Icons.spinner className=" w-4 h-4 mr-2   animate-spin" />
                  Sending Transaction...
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={handleTransaction}
                  className="p-2 font-bold  w-full "
                >
                  Escrow
                  <span id="token-amount" className="px-1">
                    {" "}
                    {paymentDetails.amount}
                  </span>
                  <span id="token-symbol" className="px-1">
                    {selectedToken?.symbol}
                  </span>
                </Button>
              )}

              <div className="text-xs lg:text-sm py-0.5  text-center text-muted-foreground">
                payment is made as soon as a submission is accepted.
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PayModal;
