"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { CreateProjectModal } from "./create-project-modal";
import { ProjectDetailModal } from "./project-detail-modal";
import { getOrganizationProjects } from "../../actions/projects/get-organization-projects";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

export function OrganizationProjects({
  organizationId,
}: {
  organizationId: string;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setShowDetailModal(true);
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
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Create and manage projects for your organization.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
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
              key={project.id}
              project={project}
              onViewProject={handleViewProject}
            />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {projects?.completedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewProject={handleViewProject}
            />
          ))}
        </TabsContent>
      </Tabs>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => {
          console.log("Creating project with data:", data);
          setShowCreateModal(false);
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
  project: any;
  onViewProject: (project: any) => void;
}

function ProjectCard({ project, onViewProject }: ProjectCardProps) {
  const params = useParams();
  const orgId = params.orgId;
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription className="mt-1">
              {project.description}
            </CardDescription>
          </div>
          <ProjectStatusBadge
            status={project.status}
            votingStatus={project.votingStatus}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {project.status !== "pending_approval" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full p-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-sm text-muted-foreground">
                  {project.spent} / {project.budget} SOL
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full p-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Timeline</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(project.startDate)} -{" "}
                  {formatDate(project.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full p-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Contributors</p>
                <div className="flex items-center">
                  {project.contributors.length > 0 ? (
                    <div className="flex -space-x-2">
                      {project.contributors
                        .slice(0, 3)
                        .map((contributor: any, i: number) => (
                          <Avatar
                            key={i}
                            className="h-6 w-6 border-2 border-background"
                          >
                            <AvatarImage
                              src={contributor.avatar || "/placeholder.svg"}
                              alt={contributor.name}
                            />
                            <AvatarFallback>
                              {contributor.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      {project.contributors.length > 3 && (
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs">
                          +{project.contributors.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No contributors yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {project.status === "pending_approval" && (
            <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md text-sm dark:bg-amber-900/20 dark:text-amber-400 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                Voting in progress: {project.votingStatus.votesFor} for,{" "}
                {project.votingStatus.votesAgainst} against
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {project.tasks.completed} of {project.tasks.total} tasks completed
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href={`/organizations/${orgId}/projects/${project.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
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
