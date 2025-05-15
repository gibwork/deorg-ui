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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Create and manage projects for your organization.
          </p>
        </div> */}
        <Link
          href={`/organizations/${organizationId}/projects/new`}
          className={cn(
            buttonVariants({ variant: "default" }),
            "flex items-center gap-2"
          )}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Link>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active ({projects?.activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({projects?.completedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {projects?.activeProjects.map((project) => (
            <ProjectCard
              key={project.uuid}
              project={project}
              onViewProject={handleViewProject}
            />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {projects?.completedProjects.map((project) => (
            <ProjectCard
              key={project.uuid}
              project={project}
              onViewProject={handleViewProject}
            />
          ))}
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
      <Card className="mb-2">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{project.title}</CardTitle>
              <Badge variant="outline" className="my-2 me-2 rounded-sm">
                {project.isActive ? "in progress" : "completed"}
              </Badge>
              <div className="inline-block">
                <Badge variant="outline" className="my-2 me-2 rounded-sm">
                  <Copy className="mr-2 h-3 w-3" />
                  {truncate(project.accountAddress, 6, 4)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center">
              {project.members.length > 0 ? (
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((contributor, i: number) => (
                    <Avatar
                      key={i}
                      className="h-8 w-8 border-2 border-background"
                    >
                      <AvatarImage
                        src={contributor.profilePicture || "/placeholder.svg"}
                        alt={contributor.username}
                      />
                      <AvatarFallback>
                        {contributor.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.members.length > 3 && (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No contributors yet
                </span>
              )}
            </div>
            {/* <ProjectStatusBadge
            status={project.status}
            votingStatus={project.votingStatus}
          /> */}
          </div>
        </CardHeader>

        <CardContent className="p-0" />
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
