"use client";

import { useOrganization } from "../../hooks/use-organization";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { OrganizationProposals } from "./organization-proposals";

import Image from "next/image";
import { useCheckMembership } from "../../hooks/use-check-membership";
import { FollowOrganizationButton } from "../follow-organization-button";
import { LoaderButton } from "@/components/loader-button";
import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationOverview({
  organizationId,
}: {
  organizationId: string;
}) {
  const { data: organization, error } = useOrganization(organizationId);

  const { isLoading: isMembershipLoading } = useCheckMembership(organizationId);

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load organization details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (organization)
    return (
      <div className="space-y-6 pb-20">
        {/* header */}

        <div className="bg-white dark:bg-gray-950 rounded-lg border p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex w-full gap-3">
              <div className="h-20 w-20">
                <Image
                  src={organization?.metadata?.logoUrl ?? organization.logoUrl}
                  alt={organization?.name}
                  width={100}
                  height={100}
                  className="rounded-lg "
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-3 w-full">
                <div className="flex flex-col  w-full">
                  <h1 className="text-2xl font-bold">{organization?.name}</h1>

                  <div className="flex flex-row items-center gap-3 text-sm text-stone-500">
                    <span className="flex items-center gap-1">
                      {organization.contributors?.length || 0} contributors
                    </span>
                    •
                    <span className="flex items-center gap-1">
                      {organization.members?.length || 0} Followers
                    </span>
                  </div>
                </div>

                <div className="md:inline-flex md:justify-end ">
                  {!isMembershipLoading ? (
                    <FollowOrganizationButton organizationId={organizationId} />
                  ) : (
                    <LoaderButton
                      variant="default"
                      size={"sm"}
                      className="w-36 md:w-24 "
                      isLoading={isMembershipLoading}
                    ></LoaderButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <OrganizationProposals organizationId={organizationId} />
      </div>
    );
}

// Loading skeleton component for the organization overview
export function OrganizationOverviewSkeleton() {
  return (
    <div className="space-y-6 pb-20">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-gray-950 rounded-lg border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex w-full gap-3">
            <div className="h-20 w-20">
              <Skeleton className="w-20 h-20 rounded-lg" />
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-3 w-full">
              <div className="flex flex-col w-full">
                <Skeleton className="h-8 w-48 mb-2" />
                <div className="flex flex-row items-center gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              <div className="md:inline-flex md:justify-end">
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals section skeleton */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col w-full gap-2 mb-8">
            <Skeleton className="h-4 w-16" />

            {/* Active proposals skeleton */}
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-950 rounded-lg border"
                >
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-6 w-64" />
                        </div>
                        <Skeleton className="h-4 w-80" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-8 w-12" />
                      </div>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full gap-2">
            <Skeleton className="h-4 w-12" />

            {/* Past proposals skeleton */}
            <div className="space-y-3">
              {Array.from({ length: 1 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-950 rounded-lg border"
                >
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Skeleton className="h-5 w-20 rounded-full" />
                          <Skeleton className="h-6 w-56" />
                        </div>
                        <Skeleton className="h-4 w-72" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
