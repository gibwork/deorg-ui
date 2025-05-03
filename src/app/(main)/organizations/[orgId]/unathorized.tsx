"use client";
import { LoaderButton } from "@/components/loader-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWalletAuth } from "@/features/auth/lib/wallet-auth";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { UserMembershipParams } from "@/lib/organizations";
import { useState } from "react";
import { JoinOrganizationDialog } from "@/features/organizations/components/join-organization-dialog";
import { useOrganization } from "@/features/organizations/hooks/use-organization";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCheckMembership } from "@/features/organizations/hooks/use-check-membership";
import { useQueryClient } from "@tanstack/react-query";

interface UnauthorizedProps {
  orgId: string;
  children: React.ReactNode;
}

export function Unauthorized({ orgId, children }: UnauthorizedProps) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoading: isWalletAuthLoading, handleSignIn } = useWalletAuth();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const { data: organization, isLoading: isOrganizationLoading } =
    useOrganization(orgId);
  const { data: membershipData, isLoading: isMembershipLoading } =
    useCheckMembership(orgId, { enabled: !!userId });

  const handleJoinSuccess = () => {
    if (!organization) return;

    // Invalidate membership check query to trigger a re-fetch
    queryClient.invalidateQueries({
      queryKey: ["organization_membership", orgId],
    });

    // Refresh the page to update the UI
    router.refresh();
  };

  // Show loading spinner while any data is loading
  if (!isLoaded || isOrganizationLoading || isMembershipLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Show connect wallet alert for unauthenticated users
  if (!userId) {
    return (
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 w-full">
          <div className="container py-3 px-4 md:px-6">
            <div className="flex items-center justify-center">
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
                  <LoaderButton
                    isLoading={isWalletAuthLoading}
                    onClick={handleSignIn}
                  >
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

  // Show join organization alert for non-members
  if (organization && !membershipData?.isMember) {
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

  if (membershipData?.isMember) {
    return <>{children}</>;
  }
}
