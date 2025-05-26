import { useConnection } from "@solana/wallet-adapter-react";

import { Organization } from "@/types/types.organization";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
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
import { Transaction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function DepositModal({
  isOpen,
  onClose,
  organization,
}: {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
}) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const isMobile = useIsMobile();

  const handleDeposit = async () => {
    if (!publicKey || !amount || !organization) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // Get user's token account
      const userTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(organization.tokenMint),
        publicKey
      );

      const treasuryTokenAccount = organization.treasuryBalances[0]!;

      // Convert amount to raw value using decimals
      const rawAmount = Math.floor(
        parseFloat(amount) * Math.pow(10, treasuryTokenAccount.decimals)
      );

      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // console.log({
      //   from: userTokenAccount.toBase58(), // from
      //   to: treasuryTokenAccount.tokenAccount, // to
      //   mint: organization.tokenMint, // mint
      //   amount: rawAmount,
      // });

      // Add transfer instruction
      const transferInstruction = createTransferInstruction(
        userTokenAccount, // from
        new PublicKey(treasuryTokenAccount.tokenAccount), // to
        publicKey, // owner (signer)
        BigInt(rawAmount)
      );

      transaction.add(transferInstruction);

      // Send transaction
      if (!signTransaction) throw new Error("Wallet not connected");
      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      await connection.confirmTransaction(signature);

      onClose();
    } catch (error) {
      console.error("Error depositing:", error);
      setError(
        error instanceof Error ? error.message : "Failed to process deposit"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const DepositContent = () => (
    <div className="pb-3">
      <div className="grid gap-4 py-4 ">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Token: {organization?.token?.symbol}
          </p>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </div>
      <div className="flex justify-between gap-2  sm:justify-end">
        <Button variant="outline" className="w-full" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleDeposit}
          className="w-full"
          disabled={isLoading || !amount || !publicKey}
        >
          {isLoading ? "Processing..." : "Deposit"}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={onClose}
        dismissible={isLoading ? false : true}
      >
        <DrawerContent
          onInteractOutside={(e) => {
            if (isLoading) {
              e.preventDefault();
            }
          }}
        >
          <DrawerHeader>
            <DrawerTitle>Deposit to Treasury</DrawerTitle>
            <DrawerDescription>
              Enter the amount you want to deposit to the organization treasury.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <DepositContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit to Treasury</DialogTitle>
          <DialogDescription>
            Enter the amount you want to deposit to the organization treasury.
          </DialogDescription>
        </DialogHeader>
        <DepositContent />
      </DialogContent>
    </Dialog>
  );
}
