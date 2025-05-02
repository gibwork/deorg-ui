import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getOrganizationProjects } from "../../actions/projects/get-organization-projects";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2, XCircle, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditProjectForm } from "./edit-project-form";
import VoteProjectButton from "./vote-project-button";
function ProjectsList({ currentUserRole }: { currentUserRole: string }) {
  const params = useParams();
  const organizationId = params.id as string;
  const loadMoreRef = useRef(null);
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["organization_projects", organizationId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const projects = await getOrganizationProjects(
        organizationId,
        pageParam,
        "active"
      );
      if (projects.error) throw new Error(projects.error.message);
      return projects!.success!.activeProjects;
    },
    getNextPageParam: (lastPage, allPages) => {
      // return undefined;
      //CREATES Dupplicates?
      if (lastPage?.length === 0) return undefined;
      return allPages?.length + 1;
    },
  });

  const handleObserver = useCallback(
    (entries: any) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage) {
        !isFetching && fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetching]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    };
    const curr = loadMoreRef.current;
    const observer = new IntersectionObserver(handleObserver, option);
    if (curr) observer.observe(curr);
    return () => {
      if (curr) observer.unobserve(curr);
    };
  }, [handleObserver]);

  const projects = data?.pages?.flatMap((page) => page) || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PROPOSED":
        return "default";
      case "APPROVED":
        return "secondary";
      case "IN_PROGRESS":
        return "secondary";
      case "COMPLETED":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "PROPOSED":
        return "bg-gray-100 text-gray-800";
      case "VOTING":
        return "bg-green-100 text-green-800";
      case "APPROVED":
        return "bg-green-300 text-green-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-theme text-white";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const isVotingActive = (status: string, votingDeadline: string) => {
    if (status === "VOTING") {
      return new Date(votingDeadline) > new Date();
    }
    return false;
  };

  const canVote = (project: any) => {
    if (!userId) return false;
    if (currentUserRole === "ADMIN" || currentUserRole === "CONTRIBUTOR") {
      return !project.votes?.some(
        (vote: any) => vote.voter.user.externalId === userId
      );
    }
    return false;
  };

  const hasVoted = (project: any) => {
    if (!userId) return false;
    return project.votes?.some(
      (vote: any) => vote.voter.user.externalId === userId
    );
  };

  const isProjectCreator = (project: any) => {
    return project.creator?.externalId === userId;
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setIsEditDrawerOpen(true);
  };

  if (projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">No projects found</p>
      </div>
    );
  }
  return (
    <ScrollArea className="h-[calc(100vh-10rem)]">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Projects</h2>
          {["ADMIN", "CONTRIBUTOR"].includes(currentUserRole) && (
            <Link
              href={`/organizations/${organizationId}/new-project`}
              className={buttonVariants({ size: "sm" })}
            >
              Create Project
            </Link>
          )}
        </div>
        <div className="grid gap-4">
          {projects.map((project: any) => {
            const votingActive = isVotingActive(
              project.status,
              project.votingDeadline
            );
            const userCanVote = canVote(project);
            const userHasVoted = hasVoted(project);
            const userIsCreator = isProjectCreator(project);

            return (
              <Card
                key={project.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {votingActive && (
                        <Badge variant={userHasVoted ? "secondary" : "default"}>
                          {userHasVoted ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              Voted
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Not Voted
                            </div>
                          )}
                        </Badge>
                      )}
                      <Badge
                        variant={getStatusBadgeVariant(project.status)}
                        className={cn(getStatusBgColor(project.status))}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>Budget: </span>
                        <span>
                          {project.token?.amount || 0}{" "}
                          {project.token?.symbol || ""}
                        </span>
                        {project.token?.imageUrl && (
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={project.token.imageUrl}
                              alt={project.token.symbol}
                            />
                            <AvatarFallback className="bg-muted" />
                          </Avatar>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Deadline: {formatDate(project.projectDeadline)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Voting ends: {formatDate(project.votingDeadline)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      {votingActive && userCanVote && !userHasVoted && (
                        <VoteProjectButton project={project} />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/organizations/${organizationId}/projects/${project.id}`
                          )
                        }
                      >
                        View Details
                      </Button>
                      {userIsCreator && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                        >
                          Edit Project
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div ref={loadMoreRef} className="h-10" />
      </div>

      <Sheet open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-[540px]">
          <SheetHeader className="bg-stone-50 dark:bg-muted dark:border-gray-700 dark:text-white -mx-6 py-2 px-3 border-t-2 border-b-2 border-stone-200">
            <SheetTitle className="font-bold relative">
              Edit Project
              <SheetClose className="absolute right-1 top-0 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>
          <div className="px-2 py-2">
            {selectedProject && (
              <EditProjectForm
                project={selectedProject}
                onClose={() => setIsEditDrawerOpen(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </ScrollArea>
  );
}

export default ProjectsList;
