"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import {
  connectDecafWallet,
  getDecafWallet,
} from "@/actions/post/decaf-wallet";
import SelectDecafWallet from "../components/select-decaf-wallet-modal";
import { useState } from "react";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const FormSchema = z.object({
  email: z
    .string({
      required_error: "Please select an email to display.",
    })
    .email(),
});

export function SelectDecafEmailForm() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const transaction = useTransactionStatus();
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isloading, setIsLoading] = useState(false);

  const [userDecafAccount, setUserDecafAccount] = useState<any>();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setIsSelectModalOpen(true);
      setIsLoading(true);
      const { success, error } = await getDecafWallet(data.email);
      if (error) {
        throw new Error(error.message);
      }
      setUserDecafAccount(success[0]);
    } catch (error) {
      toast.error((error as Error).message);
      setIsSelectModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleConnectWallet = async (emailId: string, wallet: string) => {
    try {
      transaction.onStart();
      const { success, error } = await connectDecafWallet(emailId, wallet);
      if (error) {
        throw new Error(error.message);
      }

      await queryClient.invalidateQueries({
        queryKey: [`user-${user?.id}`],
      });
      toast.success("Wallet connected successfully");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      transaction.onEnd();
      setIsSelectModalOpen(false);
    }
  };

  return (
    <>
      <SelectDecafWallet
        isOpen={isSelectModalOpen}
        setIsOpen={setIsSelectModalOpen}
        userDecafAccount={userDecafAccount}
        handleConnectWallet={handleConnectWallet}
        isPending={isloading}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="md:w-2/3 space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Connect your Decaf Email to get started.</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {user?.emailAddresses?.map((email) => (
                      <SelectItem
                        key={email.emailAddress}
                        value={email.emailAddress}
                      >
                        {email.emailAddress}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  You can manage email addresses under your account settings.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </>
  );
}
