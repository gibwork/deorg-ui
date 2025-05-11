"use client";

import type React from "react";

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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Clock, CheckCircle2, Filter } from "lucide-react";
import { CreateTaskModal } from "./create-task-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { VotingSystem } from "./voting-system";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getOrganizationTasks } from "../../actions/get-organization-tasks";
import { useQuery } from "@tanstack/react-query";

export function OrganizationTasks({
  organizationId,
}: {
  organizationId: string;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [projectFilter, setProjectFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for projects (for filtering)
  const projects = [
    { id: "1", name: "Frontend Redesign" },
    { id: "2", name: "Smart Contract Audit" },
    { id: "3", name: "Marketing Campaign" },
  ];

  const { data: tasks } = useQuery({
    queryKey: ["organization_tasks", organizationId],
    queryFn: async () => {
      const tasks = await getOrganizationTasks(organizationId);
      if (tasks.error) throw new Error(tasks.error.message);
      return tasks.success;
    },
  });

  // Filter tasks based on project and search query
  const filterTasks = (tasks: any[]) => {
    return tasks.filter((task) => {
      const matchesProject =
        projectFilter === "all" || task.projectId === projectFilter;
      const matchesSearch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProject && matchesSearch;
    });
  };

  const filteredOpenTasks = filterTasks(tasks?.openTasks || []);
  const filteredCompletedTasks = filterTasks(tasks?.completedTasks || []);

  const handleVoteOnTask = (task: any) => {
    setSelectedTask(task);
    setShowVotingModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Manage and track tasks for your organization.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Project</span>
          </div>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-2/3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Search Tasks</span>
          </div>
          <Input
            placeholder="Search by title or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <Tabs defaultValue="open" className="w-full">
        <TabsList>
          <TabsTrigger value="open">
            Open ({filteredOpenTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filteredCompletedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4 mt-6">
          {filteredOpenTasks.length > 0 ? (
            filteredOpenTasks.map((task) => (
              <TaskCard key={task.id} task={task} onVote={handleVoteOnTask} />
            ))
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">
                No tasks match your filters
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {filteredCompletedTasks.length > 0 ? (
            filteredCompletedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onVote={handleVoteOnTask} />
            ))
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">
                No completed tasks match your filters
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => {
          console.log("Creating task with data:", data);
          setShowCreateModal(false);
        }}
      />

      {selectedTask && showVotingModal && (
        <Dialog open={showVotingModal} onOpenChange={setShowVotingModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Vote on Task</DialogTitle>
              <DialogDescription>
                Cast your vote on &quot;{selectedTask.title}&quot;
              </DialogDescription>
            </DialogHeader>
            <VotingSystem
              entityType="task"
              entityId={selectedTask.id}
              entityTitle={selectedTask.title}
              votingStatus={selectedTask.votingStatus}
              votes={selectedTask.votes}
              onVote={(vote, comment) => {
                console.log(`Voted ${vote} with comment: ${comment}`);
                setShowVotingModal(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: any;
  onVote?: (task: any) => void;
}

function TaskCard({ task, onVote }: TaskCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{task.title}</CardTitle>
            <CardDescription className="mt-1">
              {task.projectName} • {task.estimatedHours} hours estimated •{" "}
              {task.reward} SOL reward
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {task.requiresVoting && task.votingStatus && (
              <Badge
                variant="outline"
                className={`
                  ${
                    task.votingStatus.status === "voting"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      : ""
                  }
                  ${
                    task.votingStatus.status === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : ""
                  }
                  ${
                    task.votingStatus.status === "rejected"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : ""
                  }
                `}
              >
                {task.votingStatus.status === "voting"
                  ? "Voting"
                  : task.votingStatus.status === "approved"
                  ? "Approved"
                  : "Rejected"}
              </Badge>
            )}
            <TaskStatusBadge status={task.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm mb-4">{task.description}</p>

        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center">
            <Badge
              variant="outline"
              className={`
              ${
                task.priority === "high"
                  ? "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400"
                  : ""
              }
              ${
                task.priority === "medium"
                  ? "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                  : ""
              }
              ${
                task.priority === "low"
                  ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400"
                  : ""
              }
            `}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{" "}
              Priority
            </Badge>
          </div>

          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {task.status === "completed"
                ? `Completed on ${task.completedDate}`
                : `Due ${task.dueDate}`}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center">
          {task.assignee ? (
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage
                  src={task.assignee.avatar || "/placeholder.svg"}
                  alt={task.assignee.name}
                />
                <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{task.assignee.name}</p>
                <p className="text-xs text-muted-foreground">
                  {task.assignee.address}
                </p>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm">
              Apply for Task
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          {task.requiresVoting &&
            task.votingStatus &&
            task.votingStatus.status === "voting" &&
            onVote && (
              <Button size="sm" onClick={() => onVote(task)}>
                Cast Vote
              </Button>
            )}
          {task.status === "in_progress" && (
            <Button size="sm">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// interface DialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   children: React.ReactNode
// }

// function Dialog({ open, onOpenChange, children }: DialogProps) {
//   return (
//     <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
//       <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
//       <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{children}</div>
//     </div>
//   )
// }

function TaskStatusBadge({ status }: { status: string }) {
  let className = "px-2.5 py-0.5 text-xs font-medium rounded-full ";

  switch (status) {
    case "open":
      className +=
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
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
    open: "Open",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return <span className={className}>{statusMap[status] || status}</span>;
}
