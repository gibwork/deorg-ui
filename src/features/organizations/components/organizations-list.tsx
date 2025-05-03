"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllOrganizations } from "../actions/get-all-organizations";
import { useQuery } from "@tanstack/react-query";
import { Organization } from "@/types/types.organization";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar, Users, WalletIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useAuth,
  useOrganizationList,
  useSignIn,
  useUser,
} from "@clerk/nextjs";
import { UserMembershipParams } from "@/lib/organizations";
import { useState } from "react";
import { JoinOrganizationDialog } from "./join-organization-dialog";
import { Card } from "@/components/ui/card";
import { formatDate } from "date-fns";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LoaderButton } from "@/components/loader-button";
import { useWalletAuth } from "@/features/auth/lib/wallet-auth";
import { WalletButton } from "@/components/wallet-button";

const OrganizationsList = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoading: isWalletAuthLoading, handleSignIn } = useWalletAuth();
  const { userMemberships, setActive } =
    useOrganizationList(UserMembershipParams);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

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

  const isUserMember = (externalId: string): boolean => {
    return (
      userMemberships?.data?.some(
        (membership: { organization: { id: string } }) =>
          membership.organization.id === externalId
      ) || false
    );
  };

  const handleJoinClick = (org: Organization) => {
    setSelectedOrganization(org);
  };

  const handleJoinSuccess = () => {
    if (!selectedOrganization || !setActive) return;

    setActive({
      organization: selectedOrganization.externalId,
      beforeEmit: () => {
        router.push(`/organizations/${selectedOrganization.id}`);
      },
    });
  };

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
    <section>
      {/* header here */}
      <div className="flex items-center justify-between p-4">
        <h1 className="text-3xl font-bold">DeOrg</h1>
        <div className="flex items-center justify-end gap-2">
          <WalletButton />
        </div>
      </div>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Organizations</h1>
          {organizations?.length > 0 && (
            <Link
              href="/organizations/create"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Create Organization
            </Link>
          )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {organizations.map((org: Organization) => (
              <Card
                key={org.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/organizations/${org.id}`)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 md:h-16 md:w-16">
                    <AvatarImage src={org.logoUrl} alt={org.name} />
                    <AvatarFallback>
                      {org.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {org.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Users size={14} className="mr-1" />
                      {org.members.length}{" "}
                      {org.members.length === 1 ? "member" : "members"}
                    </div>
                  </div>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                  {org.description || "No description provided"}
                </p>

                <div className="text-xs text-gray-500 mb-4 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Created {formatDate(org.createdAt, "MMM d, yyyy")}
                </div>

                <div className="hidden  gap-2 mt-4">
                  {isUserMember(org.externalId) ? (
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/organizations/${org.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinClick(org);
                      }}
                      variant="default"
                    >
                      Join Organization
                    </Button>
                  )}
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

        {selectedOrganization && (
          <JoinOrganizationDialog
            organization={selectedOrganization}
            isOpen={!!selectedOrganization}
            onOpenChange={(open) => !open && setSelectedOrganization(null)}
            onSuccess={handleJoinSuccess}
          />
        )}
      </div>
    </section>
  );
};

export default OrganizationsList;
