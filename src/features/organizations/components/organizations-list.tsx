"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllOrganizations } from "../actions/get-all-organizations";
import { useQuery } from "@tanstack/react-query";
import { Organization } from "@/types/types.organization";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Plus, Users, WalletIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useOrganizationList } from "@clerk/nextjs";
import { UserMembershipParams } from "@/lib/organizations";
import { useState } from "react";
import { JoinOrganizationDialog } from "./join-organization-dialog";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LoaderButton } from "@/components/loader-button";
import { useWalletAuthContext } from "@/features/auth/lib/wallet-auth-context";
import { Badge } from "@/components/ui/badge";

import Image from "next/image";
import OrganizationLayoutHeader from "./organization-layout-header";
const OrganizationsList = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoading: isWalletAuthLoading, handleSignIn } =
    useWalletAuthContext();

  const {
    data: organizations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const organizations = await getAllOrganizations();
      if (organizations.error) throw new Error(organizations.error);
      return organizations!.success;
    },
  });

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load organizations. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <section className="pb-20">
      {/* header here */}
      <OrganizationLayoutHeader />

      <div className="flex flex-row gap-5 border-b-2 border-gray-200 justify-between mt-2 pb-20">
        <div className="mx-auto w-full max-w-screen-lg flex items-center gap-5 ">
          <div className="flex justify-between">
            <div className="w-full sm:w-2/4 p-4 mt-10">
              <h1 className="text-3xl font-bold">
                Where On-chain Communities Thrive
              </h1>
              <p className="text-gray-500 mt-4">
                DeOrg is a Task protocol for communities to propose, fund and
                complete work transparently onchain.
              </p>
              <Link
                href="/organizations/create"
                className={cn(
                  buttonVariants({ variant: "default", className: "mt-4" })
                )}
              >
                <Plus size={14} className="mr-2" />
                Create Organization
              </Link>
            </div>
            <Image
              className="h-68 hidden sm:block"
              src="https://cdn.gib.work/images/44.png"
              width={480}
              height={330}
              alt="DeOrg cartoon monkeys illustration"
            />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-screen-lg flex items-center gap-5 ">
        <div className="container">
          <div className="flex flex-col mb-8  mt-10">
            <h1 className="text-2xl font-bold">Communities</h1>
            <div className="flex flex-row gap-2 mt-4">
              <Badge
                variant="default"
                className="rounded-sm bg-stone-200 px-4 text-stone-600 hover:bg-stone-100 gap-1 text-lg"
              >
                Explore
              </Badge>
              {/* {isSignedIn && (
                <Badge
                  variant="default"
                  className="rounded-sm bg-stone-50 px-4 text-stone-600 hover:bg-stone-100 gap-1 text-lg"
                >
                  Yours
                </Badge>
              )} */}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse h-64">
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="mt-4 h-10 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          ) : organizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org: Organization, idx: number) => (
                <Card
                  key={idx}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer rounded-2xl shadow-md hover:bg-stone-200/10"
                  onClick={() =>
                    router.push(`/organizations/${org.accountAddress}`)
                  }
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12 md:h-14 md:w-14">
                      <AvatarImage
                        src={org.metadata?.logoUrl || org.logoUrl}
                        alt={org.name}
                      />
                      <AvatarFallback>
                        {org.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {org.name.length >= 30
                          ? org.name
                              .substring(0, org.name.length - 30)
                              .toUpperCase()
                          : org.name}
                      </h3>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Badge
                          variant="default"
                          className="rounded-sm bg-stone-100 px-4 text-stone-600 hover:bg-stone-100 gap-1"
                        >
                          <Users size={12} className="mr-1" />
                          {org.members.length}{" "}
                          {/* {org.members.length === 1 ? "member" : "members"} */}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-gray-300 py-12">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100">
                  <Users size={30} className="text-purple-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">
                  No organizations yet
                </h3>
                <p className="mt-1 text-gray-500">
                  Create your first organization to get started.
                </p>
                <div className="mt-6">
                  {!isSignedIn ? (
                    <div className="flex justify-center">
                      <LoaderButton
                        isLoading={isWalletAuthLoading}
                        variant="outline"
                        onClick={handleSignIn}
                      >
                        <WalletIcon className="size-4 mr-2" />
                        Connect Wallet
                      </LoaderButton>
                    </div>
                  ) : (
                    <Link
                      href="/organizations/create"
                      className={cn(buttonVariants({ variant: "default" }))}
                    >
                      Create Organization
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrganizationsList;
