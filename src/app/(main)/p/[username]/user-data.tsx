"use client";

import { getUserData } from "@/actions/get/get-user-data";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import DateComponent from "@/components/date-component";

function UserData() {
  const { username } = useParams<{ username: string }>();
  const { data, error, isLoading } = useQuery({
    queryKey: [`user-${username}`],
    queryFn: async () => {
      const user = await getUserData();
      if (user.success) return user.success;
      if (user.error) throw new Error(user.error);
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (error) return <p>Error </p>;
  return (
    <div className="max-w-5xl mx-auto pb-24">
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-8">
          {data?.transactions.map((transaction: any) => (
            <div key={transaction.id} className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src={transaction?.asset?.imageUrl} alt="Avatar" />
                <AvatarFallback className="bg-muted">?</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  {transaction?.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-black">
                    <DateComponent
                      datetime={transaction?.createdAt}
                      type="datetime"
                    />
                  </span>
                </p>
              </div>
              <div className="ml-auto font-medium">
                {transaction.type === "withdraw" ? "+" : "-"}
                {(
                  transaction?.asset?.amount /
                  Math.pow(10, transaction?.asset?.decimals)
                ).toFixed(2)}{" "}
                {transaction?.asset?.symbol}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default UserData;
