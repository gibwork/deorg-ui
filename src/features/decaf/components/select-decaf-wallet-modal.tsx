"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionStatus } from "@/hooks/use-transaction-status";

import { LoaderButton } from "@/components/loader-button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { truncate } from "@/lib/utils";
import { p } from "node_modules/nuqs/dist/serializer-DjSGvhZt";
import LoaderDots from "@/components/loader-dots";

const connectDecafWalletFormSchema = z.object({
  wallet: z.string({ required_error: "You need to select a wallet." }),
});

type ConnectDecafWalletFormValues = z.infer<
  typeof connectDecafWalletFormSchema
>;

interface DecafUser {
  id: string;
  username: string;
  name: string;
  email: string;
  photoUrl: string;
  accountInfos: WalletData[];
}

interface WalletData {
  publicKey: string;
  chain: string;
  index: number;
  isActivated: boolean;
  isPrivate: boolean;
}

function SelectDecafWallet({
  isOpen,
  setIsOpen,
  userDecafAccount,
  handleConnectWallet,
  isPending,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userDecafAccount: DecafUser;
  handleConnectWallet: (email: string, wallet: string) => void;
  isPending: boolean;
}) {
  const transaction = useTransactionStatus();
  const { publicKey } = useWallet();

  const form = useForm<ConnectDecafWalletFormValues>({
    resolver: zodResolver(connectDecafWalletFormSchema),
  });

  function onSubmit(data: ConnectDecafWalletFormValues) {
    // handleConnectWallet(data.wallet)
    handleConnectWallet(userDecafAccount.email, data.wallet);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className=""
      >
        <DialogHeader>
          <DialogTitle>Connect Decaf Wallet</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="p-2">
          {isPending && (
            <div className="flex flex-col items-center">
              <LoaderDots />

              <p>Fetching Wallets...</p>
            </div>
          )}

          {!isPending && userDecafAccount && (
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">
                  {userDecafAccount.name}
                </h2>
                <span className="text-sm ">@{userDecafAccount.username}</span>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="wallet"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel>Available wallets</FormLabel>
                        <FormDescription>
                          Select a wallet to continue
                        </FormDescription>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col"
                          >
                            {userDecafAccount.accountInfos
                              .filter((wallet) => wallet.chain === "solana")
                              .map((wallet) => (
                                <FormItem
                                  key={wallet.index}
                                  className="flex items-center gap-2  "
                                >
                                  <FormControl>
                                    <RadioGroupItem value={wallet.publicKey} />
                                  </FormControl>
                                  <div className="">
                                    <FormLabel className="text-sm">
                                      {truncate(wallet.publicKey, 8, 6)}
                                    </FormLabel>
                                    <FormDescription>
                                      {wallet.isActivated
                                        ? "Active"
                                        : "Inactive"}{" "}
                                      {wallet.chain}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <LoaderButton
                    className="w-full my-2"
                    onClick={() => console.log("")}
                    isLoading={transaction.isProcessing}
                  >
                    Connect Decaf Wallet
                  </LoaderButton>
                </form>
              </Form>
            </div>
          )}

          {/* {error && <p className="text-red-500 mb-4">{error}</p>} */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SelectDecafWallet;
