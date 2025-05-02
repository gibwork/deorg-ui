import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeDollarSign, Link, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function ReferralProcessCard() {
  return (
    <Card className="">
      <CardContent className="">
        <div className="pt-5 space-y-5">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-400 dark:bg-opacity-20 ">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-200 dark:bg-violet-400 dark:bg-opacity-20  ">
                  <Link className="size-5 text-violet-800 dark:text-violet-300 " />
                </div>{" "}
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold leading-6 ">
                Share your referral link
              </h4>
              <p className="mt-1 ">
                Invite your friends to join gib.work using your unique referral
                link.
              </p>
            </div>
          </div>

          <Separator className="my-2" />
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-400 dark:bg-opacity-20 ">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-200 dark:bg-violet-400 dark:bg-opacity-20 ">
                  <UserPlus className="size-5 text-violet-800 dark:text-violet-300" />
                </div>{" "}
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold leading-6 ">
                Your friend Joins
              </h4>
              <p className="mt-1 ">
                When your friend joins gib.work through your referral link, they
                become a part of our community.
              </p>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-400 dark:bg-opacity-20 ">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-200 dark:bg-violet-400 dark:bg-opacity-20 ">
                  <BadgeDollarSign className="size-5 text-violet-800 dark:text-violet-300" />
                </div>{" "}
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold leading-6 ">
                You earn a reward
              </h4>
              <p className="mt-1 ">
                As a token of appretiation and recognition, you earn share of
                the platform fee on their first transaction.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReferralProcessCard;
