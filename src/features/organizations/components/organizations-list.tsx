"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllOrganizations } from "../actions/get-all-organizations";
import { useQuery } from "@tanstack/react-query";
import { Organization } from "@/types/types.organization";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Home, Menu, Plus, Book, Users, WalletIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PopoverPortal } from "@radix-ui/react-popover";


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
    <section className="h-[20vh] w-screen bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgba(129,81,253,0.20)_0%,rgba(255,255,255,0.00)_100%)]">
      {/* header here */}
      <div className="flex items-center justify-between p-4 ">

        <Popover>
          <PopoverTrigger asChild>
            <button className="IconButton" aria-label="Update dimensions">
              <h1 className="text-2xl font-bold inline-flex items-center gap-2 hover:bg-violet-300/20 px-2 py-1 rounded-md cursor-pointer">
                DeOrg <Menu className="size-4" />
              </h1>
            </button>
          </PopoverTrigger>
          <PopoverPortal>
            <PopoverContent className="PopoverContent ms-4 rounded-lg pt-2" sideOffset={5}>
              <div>
                <div className="flex flex-row gap-2 justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">Navigation</span>
                    <ul className="flex flex-col gap-2 mt-2">
                      <li className="text-sm text-black font-medium inline-flex items-center bg-stone-100 px-2 py-1 rounded-md cursor-pointer hover:bg-stone-100">
                        <Home size={14} className="mr-2" /> Explore
                      </li>
                      <li className="text-sm text-gray-500 font-medium inline-flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-stone-100 hover:text-black">
                        <Link
                          href="/organizations/create"
                          className={cn(buttonVariants({ variant: "link", className: "p-0 hover:no-underline hover:text-black text-sm text-gray-500 h-5" }))}
                        >
                          <Plus size={14} className="mr-2" />  Create
                        </Link>
                      </li>
                      <li className="text-sm text-gray-500 font-medium inline-flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-stone-100 hover:text-black">
                        <Book size={14} className="mr-2" /> Documentation
                      </li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">Other</span>
                    <ul className="flex flex-col gap-2 mt-2">
                      <li className="text-sm text-gray-500 font-medium inline-flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-stone-100 hover:text-black">
                        <svg role="img" className="size-4 mr-2 opacity-80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                        Twitter
                      </li>
                      <li className="text-sm text-gray-500 font-medium inline-flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-stone-100 hover:text-black">
                        <svg role="img" className="size-4 mr-2 opacity-80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Discord</title><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
                        Discord
                      </li>
                      <li className="text-sm text-gray-500 font-medium inline-flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-stone-100 hover:text-black">
                        <svg role="img" className="size-4 mr-2 opacity-80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                        Github
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </PopoverPortal>
        </Popover>

        <div className="flex items-center justify-end gap-2">
          <WalletButton />
        </div>
      </div>
      <div className="mx-auto w-full max-w-screen-lg px-4 sm:px-8 md:px-10 mt-6 flex items-center gap-5 md:mt-9">
        <div className="container mt-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Explore</h1>
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
              {organizations.map((org: Organization) => (
                <Card
                  key={org.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer rounded-2xl shadow-md hover:bg-stone-200/10"
                  onClick={() => router.push(`/organizations/${org.id}`)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12 md:h-14 md:w-14">
                      <AvatarImage src={org.logoUrl} alt={org.name} />
                      <AvatarFallback>
                        {org.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {org.name}
                      </h3>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Badge variant="default" className="rounded-sm bg-stone-100 px-4 text-stone-600 hover:bg-stone-100 gap-1">
                          <Users size={12} className="mr-1" />
                          {org.members.length}{" "}
                          {/* {org.members.length === 1 ? "member" : "members"} */}
                        </Badge>
                      </div>
                    </div>
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
      </div>

    </section>
  );
};

export default OrganizationsList;
