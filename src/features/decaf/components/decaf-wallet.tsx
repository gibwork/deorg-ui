"use client";
import React, { useState } from "react";
import { SelectDecafEmailForm } from "../forms/select-email-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { User } from "@/types/user.types";
import Image from "next/image";
import { truncate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DisconnectDecafWallet from "./disconnect-decaf-wallet";
import ChangeDecafWallet from "./change-decaf-wallet";
import { disconnectDecafWallet } from "@/actions/post/decaf-wallet";
import { toast } from "sonner";
import { useTheme } from "next-themes";
const DecafWallet = () => {
  const queryClient = useQueryClient();
  const { resolvedTheme } = useTheme();
  const { user, isLoaded } = useUser();

  const userData = queryClient.getQueryData<User>([`user-${user?.id}`]);

  return (
    <div className="py-5 max-w-[880px] rounded-lg md:shadow">
      <div className="flex items-center gap-2  px-4">
        {resolvedTheme === "dark" ? (
          <Image
            src="/images/decaf_logo.png"
            width={100}
            height={100}
            alt="decaf_dark"
            className="  w-8 "
          />
        ) : (
          <Image
            src="/images/decaf_logo.svg"
            width={100}
            height={100}
            alt="decaf_light"
            className=" "
          />
        )}
      </div>
      {userData?.decafSolWallet ? (
        <DecafConnected publicKey={userData.decafSolWallet} />
      ) : (
        <DecafConnect />
      )}
    </div>
  );
};

export default DecafWallet;

interface DecafConnectProps {
  onConnect: (email: string) => void;
}

const DecafConnect = () => {
  const [email, setEmail] = useState<string>("");

  return (
    <div className="p-4 ">
      <h2 className="text-xl font-semibold  ">Connect Your Decaf Wallet</h2>
      <p className="mb-4 pt-1 text-sm md:text-base text-gray-700 dark:text-gray-300">
        To streamline your payment process, connect your Decaf Wallet and
        receive payments directly without needing to sign any transactions.
      </p>

      <SelectDecafEmailForm />

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Why Connect?</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>No transaction signatures required for withdrawals.</li>
              <li>Get paid instantly and securely into your Decaf Wallet.</li>
              <li>Manage all your earnings in one place.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How to Connect:</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>
                Create your decaf wallet{" "}
                <Link
                  href="https://www.decaf.so/"
                  target="_blank"
                  className="text-blue-500"
                >
                  here
                </Link>{" "}
                (if you don&apos;t have one yet).
              </li>
              <li>
                Add your Decaf Wallet email address under account settings.
              </li>
              <li>Verify your account in just a few seconds.</li>
              <li>
                Once verified and connected all future payments can be withdrawn
                directly into your Decaf Wallet.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

interface DecafConnectedProps {
  email: string;
  onDisconnect: () => void;
}

const DecafConnected = ({ publicKey }: { publicKey: string }) => {
  const queryClient = useQueryClient();
  const { user, isLoaded } = useUser();

  const [isDisconnectWalletOpen, setIsDisconnectWalletOpen] =
    useState<boolean>(false);
  const [isChangeDecafWalletOpen, setIsChangeDecafWalletOpen] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      const { success, error } = await disconnectDecafWallet(publicKey);
      if (error) {
        throw new Error(error.message);
      }

      await queryClient.invalidateQueries({
        queryKey: [`user-${user?.id}`],
      });
      toast.success("Wallet disconnected");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
      setIsDisconnectWalletOpen(false);
    }
  };

  const handleChangeWallet = async () => {
    console.log("");
  };
  return (
    <div className=" p-4 ">
      <h2 className="text-xl font-semibold">Decaf Wallet Connected 🎉</h2>
      <p className="mb-2 text-gray-600 dark:text-gray-300">
        Your Decaf Wallet has been successfully connected.
      </p>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        <span className="font-semibold">Wallet:</span>{" "}
        {truncate(publicKey, 8, 6)}
      </p>
      <div className="space-x-4">
        <DisconnectDecafWallet
          isOpen={isDisconnectWalletOpen}
          setIsOpen={setIsDisconnectWalletOpen}
          title="Disconnect Decaf Wallet"
          description="Are you sure you want to disconnect your Decaf wallet?"
          confirmText="Yes, Disconnect"
          onConfirm={handleDisconnect}
          isPending={isLoading}
        />
        {/* <ChangeDecafWallet
        isOpen={isChangeDecafWalletOpen}
        setIsOpen={setIsChangeDecafWalletOpen}
        title="You are about to change your connected Decaf wallet."
        description="Please note that any pending payments will be redirected to the newly selected wallet. Are you sure you want to proceed?"
        confirmText="Yes, Change Wallet"
        onConfirm={handleChangeWallet}
        isPending={isLoading}
      /> */}
      </div>
    </div>
  );
};
