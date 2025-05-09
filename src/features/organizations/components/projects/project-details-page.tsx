"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  Clock,
  PlusCircle,
  ThumbsDown,
  ThumbsUp,
  Users,
  LayoutGrid,
  LayoutList,
} from "lucide-react";

import { CreateTaskButton } from "./create-task-button";
import { listTasks, Task } from "../../actions/tasks/list-tasks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useOrganizationMembers } from "../../hooks/use-organization-members";
import { useWallet } from "@solana/wallet-adapter-react";
import { compeleteTaskTransaction } from "../../actions/tasks/comlete-task";
import { toast } from "sonner";
import { Transaction } from "@solana/web3.js";
import { createProject } from "../../actions/projects/create-project";
import { getOrganizationProjects } from "../../actions/projects/get-organization-projects";
import {
  enableTaskWithdraw,
  enableTaskWithdrawTransaction,
} from "../../actions/tasks/enable-task-withdraw";
import {
  withdrawTaskFunds,
  withdrawTaskFundsTransaction,
} from "../../actions/tasks/withdraw-task-funds";
import { useOrganizationProjects } from "../../hooks/use-organization-projects";
import ProjectTaskModal from "../organization/project-task-modal";
import { OrganizationTasksKanban } from "../organization/organization-tasks-kanban";
export default function ProjectDetailsPage({
  orgId,
  projectId,
}: {
  orgId: string;
  projectId: string;
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const { data: members } = useOrganizationMembers(orgId);

  //TanStack Query to get project details
  const { data: projects } = useOrganizationProjects(orgId, "active");

  const project = (projects as any)?.activeProjects.find(
    (project: any) => project.accountAddress === projectId
  );

  console.log(project, "project");
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

  const tasks = data?.pages?.flatMap((page) => page) || [];

  const tasksByStatus = {
    ready: tasks.filter((task) => task.status === "ready"),
    completed: tasks.filter(
      (task) => task.status === "completed" && !task.reviewer
    ),
    paid: tasks.filter((task) => !!task.reviewer),
  };

  console.log(tasks, "tasks", project);

  const handleTaskCardClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetailsModal(true);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {project.title}
            </h1>
            <ProjectStatusBadge
              status={project.status}
              votingStatus={project.votingStatus}
            />
          </div>
          <p className="text-muted-foreground mt-1">{project.description}</p>
        </div>
        {members && (
          <CreateTaskButton
            members={members.filter((member) => member.role === "CONTRIBUTOR")}
            projectId={projectId}
          />
        )}
      </div>

      {/* {project.status !== "pending_approval" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
      )} */}

      <div className="md:hidden grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Budget:</span>
                <span className="font-bold">{project.budget} SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Spent:</span>
                <span>{project.spent} SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining:</span>
                <span className="text-green-600 dark:text-green-400">
                  {project.budget - project.spent} SOL
                </span>
              </div>
              <Progress
                value={(project.spent / project.budget) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Start Date:</span>
                <span>{formatDate(project.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>End Date:</span>
                <span>{formatDate(project.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Days Remaining:</span>
                <span>{getDaysRemaining(project.endDate)}</span>
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                <div
                  className="h-full bg-blue-500 rounded-full dark:bg-blue-600"
                  style={{
                    width: `${getTimelineProgress(
                      project.startDate,
                      project.endDate
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader>
            <CardTitle>Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            {project.members.length > 0 ? (
              <div className="space-y-4">
                {project.members.map((contributor: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={contributor.profilePicture || "/placeholder.svg"}
                        alt={contributor.username}
                      />
                      <AvatarFallback>
                        {contributor.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{contributor.username}</p>
                      <p className="text-sm text-muted-foreground">
                        Contributor
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Apply to Join
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">
                  No contributors yet
                </p>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Apply to Join
                </Button>
              </div>
            )}
          </CardContent>
        </Card> */}
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
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("kanban")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </Button>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="space-y-4">
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
            <OrganizationTasksKanban
              columns={tasksByStatus}
              orgId={orgId}
              projectId={projectId}
            />
          )}
        </TabsContent>

        {/* <TabsContent value="milestones" className="mt-6">
          <h3 className="text-lg font-medium mb-4">Project Milestones</h3>
          <div className="space-y-4">
            {project.milestones.map((milestone: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 
                        ${
                          milestone.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : milestone.status === "in_progress"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }
                      `}
                    >
                      {milestone.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{milestone.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due {formatDate(milestone.dueDate)}
                      </p>
                    </div>
                  </div>
                  <MilestoneStatusBadge status={milestone.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="voting" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Voting Status</CardTitle>
              <CardDescription>
                {project.votingStatus.status === "voting"
                  ? "This project is currently being voted on by contributors."
                  : project.votingStatus.status === "approved"
                  ? "This project has been approved by contributors."
                  : "This project has been rejected by contributors."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Approval Rate:</span>
                  <span className="font-bold">
                    {Math.round(
                      (project.votingStatus.votesFor /
                        project.votingStatus.totalVotes) *
                        100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (project.votingStatus.votesFor /
                      project.votingStatus.totalVotes) *
                    100
                  }
                  className="h-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{project.votingStatus.votesFor} For</span>
                  <span>{project.votingStatus.votesAgainst} Against</span>
                  <span>
                    {project.votingStatus.totalVotes -
                      project.votingStatus.votesFor -
                      project.votingStatus.votesAgainst}{" "}
                    Remaining
                  </span>
                </div>

                {project.votingStatus.status === "voting" && (
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="w-1/2">
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Vote Against
                    </Button>
                    <Button className="w-1/2">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Vote For
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">Votes & Comments</h3>
            {project.votes.map((vote, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={vote.voter.avatar || "/placeholder.svg"}
                        alt={vote.voter.name}
                      />
                      <AvatarFallback>
                        {vote.voter.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{vote.voter.name}</p>
                        <Badge
                          variant="outline"
                          className={`
                            ${
                              vote.vote === "for"
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                            }
                          `}
                        >
                          {vote.vote === "for" ? "Voted For" : "Voted Against"}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{vote.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {vote.timestamp}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent> */}
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
  const { signTransaction } = useWallet();

  const handleCompleteTask = async () => {
    if (!signTransaction) return;

    const { success, error } = await compeleteTaskTransaction(
      task.accountAddress
    );
    if (!success) {
      toast.error("Failed to complete task");
      return;
    }

    const retreivedTx = Transaction.from(
      Buffer.from(success.serializedTransaction, "base64")
    );

    const serializedTx = await signTransaction(retreivedTx);

    const serializedSignedTx = serializedTx?.serialize().toString("base64");

    const createProjectResponse = await createProject({
      transactionId: success.transactionId,
      serializedTransaction: serializedSignedTx,
    });

    if (createProjectResponse.error) {
      toast.error("Failed to complete task");
      return;
    }

    toast.success("Task completed successfully");
  };

  const handleEnableTaskWithdraw = async () => {
    if (!signTransaction) return;

    const { success, error } = await enableTaskWithdrawTransaction(
      task.accountAddress
    );
    if (!success) {
      toast.error("Failed to enable task withdraw");
      return;
    }

    const retreivedTx = Transaction.from(
      Buffer.from(success.serializedTransaction, "base64")
    );

    const serializedTx = await signTransaction(retreivedTx);

    const serializedSignedTx = serializedTx?.serialize().toString("base64");

    const enableTaskWithdrawResponse = await enableTaskWithdraw({
      transactionId: success.transactionId,
      serializedTransaction: serializedSignedTx,
    });

    if (enableTaskWithdrawResponse.error) {
      toast.error("Failed to enable task withdraw");
      return;
    }

    toast.success("Task withdraw enabled successfully");
  };

  const handleWithdrawTaskFunds = async () => {
    if (!signTransaction) return;

    const { success, error } = await withdrawTaskFundsTransaction(
      task.accountAddress
    );

    if (!success) {
      toast.error("Failed to withdraw task funds");
      return;
    }

    const retreivedTx = Transaction.from(
      Buffer.from(success.serializedTransaction, "base64")
    );

    const serializedTx = await signTransaction(retreivedTx);

    const serializedSignedTx = serializedTx?.serialize().toString("base64");

    const withdrawTaskFundsResponse = await withdrawTaskFunds({
      transactionId: success.transactionId,
      serializedTransaction: serializedSignedTx,
    });

    if (withdrawTaskFundsResponse.error) {
      toast.error("Failed to withdraw task funds");
      return;
    }

    toast.success("Task funds withdrawn successfully");
  };

  return (
    <>
      <button
        className="w-full"
        // href={`/organizations/${orgId}/projects/${projectId}/tasks/${task.accountAddress}`}
        onClick={() => {
          onTaskClick(task);
        }}
      >
        <Card>
          {/* <CardHeader className="pb-2">

      </CardHeader> */}
          <CardContent className="p-2 px-4 my-2">
            <div className="flex justify-between flex-row gap-2">
              <CardTitle className="text-base font-normal">
                {task.title}
              </CardTitle>
              <div className="text-sm font-medium">
                {task.paymentAmount} SOL
              </div>
              <div className="flex justify-between">
                <TaskStatusBadge status={task.status} />
              </div>
              {/* <p className="text-sm mb-4">Mock description</p> */}
              <div className="flex flex-wrap justify-between items-center">
                <div className="flex items-center gap-2">
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={
                            task.assignee.profilePicture || "/placeholder.svg"
                          }
                          alt={task.assignee.username}
                        />
                        <AvatarFallback>
                          {task.assignee.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee.username}</span>
                    </div>
                  ) : (
                    <Badge variant="outline">Unassigned</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {/* <Clock className="h-4 w-4" /> */}
                    {/* <span>Due {formatDate(task.dueDate)}</span> */}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          {/* <div className="px-6 pb-4 flex justify-end gap-2">
            {task.status === "ready" && (
              <Button onClick={handleCompleteTask} size="sm">
                Complete
              </Button>
            )}
            {task.status === "completed" && (
              <Button onClick={handleEnableTaskWithdraw} size="sm">
                Enable task withdraw
              </Button>
            )}
            {task.status === "completed" && (
              <Button onClick={handleWithdrawTaskFunds} size="sm">
                Withdraw task funds
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/organizations/${orgId}/projects/${projectId}/tasks/${task.transferProposal}`}
              >
                View Details
              </Link>
            </Button>
          </div> */}
        </Card>
      </button>
    </>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  let className = "px-2.5 py-0.5 text-xs font-medium rounded-full ";

  switch (status) {
    case "to_do":
      className +=
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      break;
    case "in_progress":
      className +=
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
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
