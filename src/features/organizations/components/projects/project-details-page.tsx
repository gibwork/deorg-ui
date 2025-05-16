"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Share2 } from "lucide-react";

import { listTasks, Task } from "../../actions/tasks/list-tasks";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useOrganizationMembers } from "../../hooks/use-organization-members";

import { useOrganizationProjects } from "../../hooks/use-organization-projects";
import ProjectTaskModal from "../organization/project-task-modal";
import { OrganizationTasksKanban } from "../organization/organization-tasks-kanban";
import { io } from "socket.io-client";
import { formatTokenAmount } from "@/utils/format-amount";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProjectDetailsPage({
  orgId,
  projectId,
}: {
  orgId: string;
  projectId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const { data: members } = useOrganizationMembers(orgId);

  //TanStack Query to get project details
  const { data: projects } = useOrganizationProjects(orgId, "active");

  const project = (projects as any)?.activeProjects.find(
    (project: any) => project.accountAddress === projectId
  );

  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["project_tasks", projectId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const tasks = await listTasks(projectId);
      return tasks;
    },
    getNextPageParam: (lastPage, allPages) => {
      // return undefined;
      //CREATES Dupplicates?
      if (lastPage?.length === 0) return undefined;
      return allPages?.length + 1;
    },
  });

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL);

    socket.on(
      "taskStatusChangeEvent",
      (data: {
        newStatus: string;
        oldStatus: string;
        project: string;
        task: string;
        timestamp: string;
      }) => {
        // Update the task status in the React Query cache
        queryClient.setQueryData(
          ["project_tasks", projectId],
          (oldData: any) => {
            if (!oldData) return oldData;

            // Create a new array with the updated task
            const updatedPages = oldData.pages.map((page: any[]) =>
              page.map((task: any) =>
                task.accountAddress === data.task
                  ? { ...task, status: data.newStatus }
                  : task
              )
            );

            // Force a re-render by creating a new object
            return {
              ...oldData,
              pages: updatedPages,
            };
          }
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [projectId, queryClient]);

  const tasks = data?.pages?.flatMap((page) => page) || [];

  const tasksByStatus = {
    ready: tasks.filter((task) => task.status === "ready"),
    completed: tasks.filter(
      (task) => task.status === "completed" && !task.reviewer
    ),
    paid: tasks.filter((task) => !!task.reviewer),
  };

  const handleTaskCardClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetailsModal(true);
  };

  return (
    <div className="space-y-6 w-full pb-20">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link
            href={`/organizations/${orgId}/projects`}
            className="hover:text-foreground"
          >
            Projects
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">{project.title}</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {project.title}
            </h1>

            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center ">
              {project.members.map((member: any, idx: number) => (
                <Avatar
                  key={member.id}
                  className={cn(
                    "size-7 shadow bg-muted border border-white",
                    idx !== 0 && "-ml-1"
                  )}
                >
                  <AvatarImage
                    src={member.profilePicture || "/placeholder.svg"}
                    alt={member.username}
                  />
                  <AvatarFallback>{member.username.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button size="icon" variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        {/* <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="voting">Voting</TabsTrigger>
        </TabsList> */}

        <TabsContent value="tasks" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Project Tasks</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="view-mode"
                  checked={viewMode === "kanban"}
                  onCheckedChange={(checked) =>
                    setViewMode(checked ? "kanban" : "list")
                  }
                />
                <Label htmlFor="view-mode" className="text-sm">
                  Board View
                </Label>
              </div>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="border rounded-md">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskCard
                    key={task.transferProposal}
                    task={task}
                    orgId={orgId}
                    projectId={projectId}
                    onTaskClick={handleTaskCardClick}
                  />
                ))
              ) : (
                <div className="text-center py-10 border rounded-lg">
                  <p className="text-muted-foreground">No tasks created yet</p>
                </div>
              )}
            </div>
          ) : (
            <div className="transition-all duration-300 ease-in-out">
              <OrganizationTasksKanban
                columns={tasksByStatus}
                orgId={orgId}
                projectId={projectId}
                onTaskClick={handleTaskCardClick}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedTask && showTaskDetailsModal && (
        <ProjectTaskModal
          project={project}
          task={selectedTask}
          showTaskDetailsModal={showTaskDetailsModal}
          setShowTaskDetailsModal={setShowTaskDetailsModal}
        />
      )}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  orgId: string;
  projectId: string;
  onTaskClick: (task: Task) => void;
}

function TaskCard({ task, orgId, projectId, onTaskClick }: TaskCardProps) {
  return (
    <>
      <div
        className="p-3 hover:bg-muted/30 cursor-pointer flex items-center border-b "
        onClick={() => onTaskClick(task)}
      >
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 capitalize">{task.title}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">
            <span>
              {" "}
              {formatTokenAmount(
                task.paymentAmount,
                task.tokenInfo.decimals
              )}{" "}
              {task.tokenInfo.symbol}
            </span>{" "}
          </div>
          <TaskStatusBadge status={task.status} />
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={task.assignee.profilePicture || "/placeholder.svg"}
              alt={task.assignee.username}
            />
            <AvatarFallback>{task.assignee.username.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </>
  );
}

export function TaskStatusBadge({ status }: { status: string }) {
  let className = "px-2.5 py-0.5 text-xs font-medium rounded-full ";

  switch (status) {
    case "ready":
      className +=
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      break;
    case "completed":
      className +=
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      break;
    case "paid":
      className +=
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    default:
      className +=
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }

  const statusMap: Record<string, string> = {
    to_do: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return <Badge className={className}>{statusMap[status] || status}</Badge>;
}

function MilestoneStatusBadge({ status }: { status: string }) {
  let className = "px-2.5 py-0.5 text-xs font-medium rounded-full ";

  switch (status) {
    case "not_started":
      className +=
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      break;
    case "in_progress":
      className +=
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      break;
    case "completed":
      className +=
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    default:
      className +=
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }

  const statusMap: Record<string, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return <Badge className={className}>{statusMap[status] || status}</Badge>;
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

  return <Badge className={className}>{statusMap[status] || status}</Badge>;
}

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Helper function to calculate days remaining
function getDaysRemaining(endDateString: string) {
  const endDate = new Date(endDateString);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// Helper function to calculate timeline progress
function getTimelineProgress(startDateString: string, endDateString: string) {
  const startDate = new Date(startDateString).getTime();
  const endDate = new Date(endDateString).getTime();
  const today = new Date().getTime();

  if (today <= startDate) return 0;
  if (today >= endDate) return 100;

  const totalDuration = endDate - startDate;
  const elapsed = today - startDate;
  return Math.round((elapsed / totalDuration) * 100);
}
