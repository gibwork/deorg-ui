"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Clock,
  FileText,
  ListChecks,
  PlusCircle,
  Users,
} from "lucide-react";
import { ProjectDetailModal } from "./project-detail-modal";
import { useOrganization } from "../../hooks/use-organization";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationOverview } from "../../actions/get-organization-overview";
import { Organization } from "@/types/types.organization";
import { OrganizationHeader } from "./organization-header";
import { useAuth } from "@clerk/nextjs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface OrganizationOverviewProps {
  organization: {
    name: string;
    description: string;
    members: number;
    contributors: number;
    balance: number;
    multisigAddress: string;
  };
}

export function OrganizationOverview({
  organizationId,
}: {
  organizationId: string;
}) {
  const { isSignedIn } = useAuth();
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);

  const {
    data: organization,
    isLoading,
    error,
  } = useOrganization(organizationId);

  const stats = [
    { label: "Active Proposals", value: 3, icon: FileText },
    { label: "Open Tasks", value: 12, icon: ListChecks },
    { label: "Contributors", value: organization?.members.length, icon: Users },
    // {
    //   label: "Treasury Balance",
    //   value: `${organization?.token?.amount} SOL`,
    //   icon: BarChart3,
    // },
  ];

  const {
    data: organizationOverview,
    isLoading: isOrganizationOverviewLoading,
    error: organizationOverviewError,
  } = useQuery({
    queryKey: ["organizationOverview", organizationId],
    queryFn: async () => {
      const organization = await getOrganizationOverview(organizationId);
      if (organization.error) throw new Error(organization.error);
      return organization.success;
    },
  });

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  if (!isSignedIn) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please connect your wallet and sign in to view organization details.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* <OrganizationHeader organizationId={organizationId} /> */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <CardDescription>
              Recent actions in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizationOverview?.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="rounded-full p-2 bg-muted">
                    {activity.type === "proposal" && (
                      <FileText className="h-4 w-4" />
                    )}
                    {activity.type === "task" && (
                      <ListChecks className="h-4 w-4" />
                    )}
                    {activity.type === "member" && (
                      <Users className="h-4 w-4" />
                    )}
                    {activity.type === "transaction" && (
                      <BarChart3 className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <Badge status={activity.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
            </div>
            <CardDescription>
              Common tasks for organization management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 justify-start text-left"
              >
                <div className="flex items-center w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span>New Proposal</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a proposal
                </p>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 justify-start text-left"
              >
                <div className="flex items-center w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span>New Task</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a task for contributors
                </p>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 justify-start text-left"
              >
                <div className="flex items-center w-full">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Manage Roles</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Update member permissions
                </p>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 justify-start text-left"
              >
                <div className="flex items-center w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span>Treasury</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Manage organization funds
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedProject && (
        <ProjectDetailModal
          isOpen={showProjectDetail}
          onClose={() => setShowProjectDetail(false)}
          project={selectedProject}
        />
      )}
    </div>
  );
}

// Helper component for activity status badges
function Badge({ status }: { status: string }) {
  let className = "px-2 py-1 text-xs rounded-full ";

  switch (status) {
    case "APPROVED":
      className +=
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case "COMPLETED":
      className +=
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      break;
    case "NEW":
      className +=
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      break;
    default:
      className +=
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }

  return <span className={className}>{status}</span>;
}

function ProjectStatusBadge({
  status,
  votingStatus,
}: {
  status: string;
  votingStatus?: any;
}) {
  let className = "px-2 py-0.5 text-xs font-medium rounded-full ";

  if (status === "VOTING") {
    className +=
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  } else if (status === "IN_PROGRESS") {
    className +=
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  } else if (status === "COMPLETED") {
    className +=
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  } else {
    className +=
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }

  const statusMap: Record<string, string> = {
    VOTING: "Voting",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };

  return <span className={className}>{statusMap[status] || status}</span>;
}
