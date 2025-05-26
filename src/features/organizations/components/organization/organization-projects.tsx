"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PlusCircle,
  Calendar,
  Users,
  BarChart3,
  ArrowRight,
  Clock,
  Copy,
} from "lucide-react";
import { CreateProjectModal } from "./create-project-modal";
import { ProjectDetailModal } from "./project-detail-modal";
import {
  getOrganizationProjects,
  Project,
} from "../../actions/projects/get-organization-projects";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CreateProjectTransactionPayload,
  createProjectTransaction,
} from "../../actions/projects/create-project-transaction";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { createProject } from "../../actions/projects/create-project";
import { cn, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function OrganizationProjects({
  organizationId,
}: {
  organizationId: string;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const { signTransaction } = useWallet();

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const handleCreateProject = async (project: any) => {
    if (!signTransaction) return;
    try {
      const payload: CreateProjectTransactionPayload = {
        organizationId,
        name: project.title,
        description: project.description || "",
        members: project.members,
        projectProposalThreshold: 1,
        projectProposalValidityPeriod: 1,
      };

      const response = await createProjectTransaction(payload);

      console.log(response);

      const transaction = Transaction.from(
        Buffer.from(response.success.serializedTransaction, "base64")
      );

      const signature = await signTransaction(transaction);

      if (!signature) {
        throw new Error("Failed to sign transaction");
      }

      const serializedSignedTransaction = signature
        ?.serialize()
        .toString("base64");

      const createProjectResponse = await createProject({
        organizationId,
        transactionId: response.success.transactionId,
        serializedTransaction: serializedSignedTransaction,
      });

      console.log(createProjectResponse);
    } catch (error) {
      console.log(error);
    } finally {
      setShowCreateModal(false);
    }
  };

  const { data: projects, isLoading } = useQuery({
    queryKey: ["organization_projects", organizationId],
    queryFn: async () => {
      const projects = await getOrganizationProjects(
        organizationId,
        1,
        "active"
      );
      if (projects.error) throw new Error(projects.error.message);
      return projects.success;
    },
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Projects
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Create and manage projects for your organization.
          </p>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="text-xs sm:text-sm">
            Active ({projects?.activeProjects.length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Completed ({projects?.completedProjects.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {projects?.activeProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Active Projects
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Get started by creating your first project
                </p>
                <Link
                  href={`/organizations/${organizationId}/proposals/new`}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "flex items-center gap-2"
                  )}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Project
                </Link>
              </CardContent>
            </Card>
          ) : (
            projects?.activeProjects.map((project) => (
              <ProjectCard
                key={project.uuid}
                project={project}
                onViewProject={handleViewProject}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {projects?.completedProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Completed Projects
                </h3>
                <p className="text-muted-foreground text-center">
                  Projects will appear here once they are completed
                </p>
              </CardContent>
            </Card>
          ) : (
            projects?.completedProjects.map((project) => (
              <ProjectCard
                key={project.uuid}
                project={project}
                onViewProject={handleViewProject}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <CreateProjectModal
        isOpen={showCreateModal}
        organizationId={organizationId}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          handleCreateProject(data);
        }}
      />

      {selectedProject && (
        <ProjectDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          project={selectedProject}
        />
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onViewProject: (project: Project) => void;
}

function ProjectCard({ project, onViewProject }: ProjectCardProps) {
  const params = useParams();
  const orgId = params.orgId;

  return (
    <Link
      className=""
      href={`/organizations/${orgId}/projects/${project.accountAddress}`}
    >
      <Card className="mb-2 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg md:text-xl truncate">
                  {project.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="rounded-sm text-xs">
                    {project.isActive ? "in progress" : "completed"}
                  </Badge>
                  <Badge variant="outline" className="rounded-sm text-xs">
                    <Copy className="mr-1 h-3 w-3" />
                    {truncate(project.accountAddress, 4, 4)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end">
                {project.members.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {project.members
                        .slice(0, 3)
                        .map((contributor, i: number) => (
                          <Avatar
                            key={i}
                            className="h-7 w-7 md:h-8 md:w-8 border-2 border-background"
                          >
                            <AvatarImage
                              src={
                                contributor.profilePicture || "/placeholder.svg"
                              }
                              alt={contributor.username}
                            />
                            <AvatarFallback className="text-xs">
                              {contributor.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      {project.members.length > 3 && (
                        <div className="flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-full bg-muted text-xs border-2 border-background">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {project.members.length} member
                      {project.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs md:text-sm text-muted-foreground">
                    No contributors yet
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

function ProjectStatusBadge({
  status,
  votingStatus,
}: {
  status: string;
  votingStatus?: any;
}) {
  let className = "px-2.5 py-0.5 text-xs font-medium rounded-full ";

  if (status === "pending_approval") {
    className +=
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  } else if (status === "in_progress") {
    className +=
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  } else if (status === "completed") {
    className +=
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  } else {
    className +=
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }

  const statusMap: Record<string, string> = {
    pending_approval: "Pending Approval",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return <span className={className}>{statusMap[status] || status}</span>;
}

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
