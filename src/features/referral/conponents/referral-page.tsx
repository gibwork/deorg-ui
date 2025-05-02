"use client";
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CircleAlert, BadgeCheck, Info, CircleHelp } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import ReferralProcessCard from "./referral-process-card";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/user.types";
import { useAuth } from "@clerk/nextjs";
import { ReferralsHistory } from "./referrals-history";
import { cn } from "@/lib/utils";
import ReferralFAQ from "./referrals-faq";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWalletTokenBalances } from "@/hooks/use-wallet-token-balances";

const ReferralPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const { data } = useWalletTokenBalances();

  const userData = queryClient.getQueryData<User>([`user-${userId}`]);

  const referralLink = useMemo(() => {
    return userData?.username
      ? `${process.env.NEXT_PUBLIC_APP_URL}?ref=${userData?.username}`
      : "";
  }, [userData]);
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      toast.success("Referral link copied!", {
        description: "Share this link to earn rewards!",
      });
    });
  };

  return (
    <div className="md:container mx-auto md:p-4 space-y-6">
      <Card className={cn("shadow-none  md:shadow-sm")}>
        <CardHeader></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/*Get started section */}

            <div className=" ">
              <div className="!pb-3">
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  {" "}
                  <CircleAlert className="size-4" /> Referral Program
                </p>
                <p className="flex items-center text-3xl xl:text-4xl font-semibold">
                  Spread the word and earn rewards
                </p>
              </div>
              <p>
                Earn a share of the platform fees for tasks created or
                completed.
              </p>
              <Separator className="mt-6 " />
              <p className="flex items-center text-xl font-semibold mt-6">
                Your referral link
              </p>

              {!userData?.primaryWallet ? (
                <p className="flex items-center gap-2 mt-3 text-sm text-gray-700 dark:text-gray-400">
                  <Info className="size-4 hidden md:block" />
                  <span>
                    <Link
                      href={`/p/${userData?.username}/account`}
                      className="underline underline-offset-4 text-blue-500"
                    >
                      Connect and Verify
                    </Link>{" "}
                    your primary wallet to get your referral link{" "}
                  </span>
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-4 mt-2 ">
                    <Input
                      id="ref-link"
                      className={cn("border-theme text-lg")}
                      value={userData?.primaryWallet ? referralLink : ""}
                      readOnly
                    />
                    <Button
                      variant={"theme"}
                      className=" focus:outline-none"
                      disabled={!userData?.primaryWallet}
                      onClick={copyReferralLink}
                    >
                      <Copy className="size-5 mr-2" />
                      Copy
                    </Button>
                  </div>
                  {data &&
                    data.length > 0 &&
                    data?.find((item) => item?.symbol === "SOL")?.tokenInfo
                      ?.balance === 0 && (
                      <p className=" flex mt-2 items-start  gap-1  text-gray-700 dark:text-gray-300">
                        <CircleAlert className="size-4 mt-1" /> Primary wallet
                        must have at least 0.01 SOL to receive referral rewards.
                      </p>
                    )}
                </>
              )}

              <p className="inline-flex items-center gap-2 mt-6 md:text-lg">
                <BadgeCheck className="text-primary-foreground size-6 fill-theme  " />
                Earn more with a verified profile
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <CircleHelp className="size-4 inline-block cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add your phone number or X account to get verified.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </p>
            </div>

            {/* Referral process Section */}

            <ReferralProcessCard />
          </div>
        </CardContent>
      </Card>

      <ReferralsHistory />

      <Separator className="my-10" />
      <ReferralFAQ />
    </div>
  );
};

export default ReferralPage;
