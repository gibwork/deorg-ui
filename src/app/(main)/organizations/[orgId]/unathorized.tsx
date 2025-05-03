"use client";
import { LoaderButton } from "@/components/loader-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWalletAuth } from "@/features/auth/lib/wallet-auth";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth, useOrganizationList } from "@clerk/nextjs";
import { UserMembershipParams } from "@/lib/organizations";
import { useState } from "react";
import { JoinOrganizationDialog } from "@/features/organizations/components/join-organization-dialog";
import { useOrganization } from "@/features/organizations/hooks/use-organization";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface UnauthorizedProps {
  orgId: string;
  children: React.ReactNode;
}

export function Unauthorized({ orgId, children }: UnauthorizedProps) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const { isLoading, handleSignIn } = useWalletAuth();
  const { userMemberships, setActive } =
    useOrganizationList(UserMembershipParams);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const { data: organization, isLoading: isOrganizationLoading } =
    useOrganization(orgId);

  const isUserMember = (externalId: string): boolean => {
    return (
      userMemberships?.data?.some(
        (membership: { organization: { id: string } }) =>
          membership.organization.id === externalId
      ) || false
    );
  };

  const handleJoinSuccess = () => {
    if (!organization || !setActive) return;

    setActive({
      organization: organization.externalId,
      beforeEmit: () => {
        router.refresh();
      },
    });
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!userId) {
    return (
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 w-full">
          <div className="container py-3 px-4 md:px-6">
            <div className=" flex items-center justify-center">
              <div className="max-w-md w-full space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    Please connect your wallet and sign in to view organization
                    details.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-center">
                  <LoaderButton isLoading={isLoading} onClick={handleSignIn}>
                    Connect Wallet
                  </LoaderButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    !isOrganizationLoading &&
    organization &&
    !isUserMember(organization.externalId)
  ) {
    return (
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 w-full">
          <div className="container py-3 px-4 md:px-6">
            <div className="flex items-center justify-center">
              <div className="max-w-md w-full space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Join Organization</AlertTitle>
                  <AlertDescription>
                    You need to join this organization to view its details.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-center">
                  <Button onClick={() => setShowJoinDialog(true)}>
                    Join Organization
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {organization && (
          <JoinOrganizationDialog
            organization={organization}
            isOpen={showJoinDialog}
            onOpenChange={setShowJoinDialog}
            onSuccess={handleJoinSuccess}
          />
        )}
      </div>
    );
  }

  return <>{children}</>;
}
