"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import Image from "next/image";
import {
  X,
  MessageSquare,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Calendar,
} from "lucide-react";

import {
  OrganizationTask,
  TaskComment,
  Member,
} from "@/types/types.organization";

interface TaskModalProps {
  task: OrganizationTask;
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onStatusChange: (
    taskId: string,
    newStatus: OrganizationTask["status"]
  ) => void;
  onCommentAdd?: (taskId: string, comment: string) => void;
  onVoteTask?: (taskId: string) => void;
}

export function TaskModal({
  task,
  isOpen,
  onClose,
  members,
  onStatusChange,
  onCommentAdd,
  onVoteTask,
}: TaskModalProps) {
  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    OrganizationTask["status"]
  >(task.status);

  const handleStatusChange = (newStatus: OrganizationTask["status"]) => {
    setSelectedStatus(newStatus);
    onStatusChange(task.id, newStatus);
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    if (onCommentAdd) {
      onCommentAdd(task.id, newComment);
      setNewComment("");
    }
  };

  const getMemberById = (id?: string) => {
    if (!id) return null;
    return members.find((member) => member.id === id) || null;
  };

  const getTaskStatusIcon = (status: OrganizationTask["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Circle className="h-5 w-5 text-blue-500" />;
      case "blocked":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: OrganizationTask["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
    }
  };

  // Generate a consistent random hourly rate for each member
  const getMemberHourlyRate = (memberId: string) => {
    // Use the member ID to generate a consistent random rate between $50 and $150
    const hash = memberId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 50 + (hash % 100); // Range: $50 to $150
  };

  // Calculate payment amount for a task
  const calculatePaymentAmount = (task: OrganizationTask) => {
    if (!task.assignedTo || !task.effortMinutes) return 0;

    const hourlyRate = getMemberHourlyRate(task.assignedTo);
    return ((hourlyRate * task.effortMinutes) / 60).toFixed(2);
  };

  // Helper function to format minutes into a human-readable format
  const formatEffortTime = (minutes: number) => {
    if (!minutes) return "Not estimated";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    } else {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ${remainingMinutes} min`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              TASK-{task.id}
            </span>
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6 mt-4">
          {/* Left column (2/3 width) */}
          <div className="col-span-2">
            <div className="space-y-6">
              {/* Description section */}
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <div className="prose prose-sm max-w-none">
                  {task.description || "No description provided."}
                </div>
              </div>

              {/* Comments section */}
              <div>
                <h3 className="text-sm font-medium mb-2">Comments</h3>
                <div className="space-y-4">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-muted/50 p-3 rounded-md"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-6 w-6 rounded-full overflow-hidden">
                            {getMemberById(comment.authorId)?.user
                              ?.profilePicture ? (
                              <div className="relative h-full w-full">
                                <Image
                                  src={
                                    getMemberById(comment.authorId)?.user
                                      ?.profilePicture || ""
                                  }
                                  alt="Author avatar"
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    // Fallback to initials if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.classList.add(
                                        "bg-primary/10",
                                        "flex",
                                        "items-center",
                                        "justify-center"
                                      );
                                      const fallback =
                                        document.createElement("span");
                                      fallback.className =
                                        "text-primary font-medium";
                                      fallback.textContent =
                                        getMemberById(
                                          comment.authorId
                                        )?.user?.username.charAt(0) || "?";
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                                {getMemberById(
                                  comment.authorId
                                )?.user?.username.charAt(0) || "?"}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {getMemberById(comment.authorId)?.user?.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No comments yet
                    </div>
                  )}

                  {/* Add Comment Form */}
                  <div className="mt-4">
                    <Textarea
                      placeholder="Add a comment..."
                      className="resize-none"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button
                      className="mt-2"
                      size="sm"
                      onClick={handleCommentSubmit}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column (1/3 width) */}
          <div className="col-span-1 border-l pl-6">
            {/* Status dropdown */}
            <div className="mb-6">
              <label className="text-sm font-medium block mb-2">Status</label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  handleStatusChange(value as OrganizationTask["status"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {getTaskStatusIcon(selectedStatus)}
                      <span className="capitalize">
                        {selectedStatus.replace("-", " ")}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">
                    <div className="flex items-center gap-2">
                      {getTaskStatusIcon("todo")}
                      <span>To Do</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center gap-2">
                      {getTaskStatusIcon("in-progress")}
                      <span>In Progress</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      {getTaskStatusIcon("completed")}
                      <span>Completed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="blocked">
                    <div className="flex items-center gap-2">
                      {getTaskStatusIcon("blocked")}
                      <span>Blocked</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="mb-6">
              <label className="text-sm font-medium block mb-2">Assignee</label>
              {task.assignedTo ? (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    {getMemberById(task.assignedTo)?.user?.profilePicture ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={
                            getMemberById(task.assignedTo)?.user
                              ?.profilePicture || ""
                          }
                          alt="Assignee avatar"
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.classList.add(
                                "bg-primary/10",
                                "flex",
                                "items-center",
                                "justify-center"
                              );
                              const fallback = document.createElement("span");
                              fallback.className = "text-primary font-medium";
                              fallback.textContent =
                                getMemberById(
                                  task.assignedTo
                                )?.user?.username.charAt(0) || "?";
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                        {getMemberById(task.assignedTo)?.user?.username.charAt(
                          0
                        ) || "?"}
                      </div>
                    )}
                  </div>
                  <span>{getMemberById(task.assignedTo)?.user?.username}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Unassigned</div>
              )}
            </div>

            {/* Effort */}
            <div className="mb-6">
              <label className="text-sm font-medium block mb-2">Effort</label>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
                  {task.effortMinutes
                    ? formatEffortTime(task.effortMinutes)
                    : "Not estimated"}
                </div>
              </div>
            </div>

            {/* Payment - only show for funded tasks */}
            {task.funded && task.assignedTo && task.effortMinutes && (
              <div className="mb-6">
                <label className="text-sm font-medium block mb-2">
                  Payment
                </label>
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full text-sm flex items-center">
                    <div className="relative h-4 w-4 mr-1">
                      <Image
                        src="/images/usdc-icon.png"
                        alt="USDC"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span>${calculatePaymentAmount(task)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Voting Status */}
            <div className="mb-6">
              <label className="text-sm font-medium block mb-2">
                Voting Status
              </label>
              <div className="flex flex-col gap-2">
                <div
                  className={`px-2 py-1 rounded-full text-sm ${
                    task.funded
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  }`}
                >
                  <span className="font-medium">
                    {task.votes?.length || 0}/{members.length} votes
                    {task.funded ? " • Quorum reached" : ""}
                  </span>
                </div>
                {task.funded && task.fundedAt && (
                  <div className="text-xs text-muted-foreground">
                    Funded on {new Date(task.fundedAt).toLocaleDateString()}
                  </div>
                )}
                {task.votes && task.votes.length > 0 && (
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground">
                      Voted by:
                    </span>
                    <div className="flex mt-1 -space-x-2">
                      {task.votes.map((vote) => {
                        const member = getMemberById(vote.memberId);
                        return member ? (
                          <div
                            key={vote.memberId}
                            className="h-6 w-6 rounded-full overflow-hidden border-2 border-background"
                            title={member.user?.username}
                          >
                            {member.user?.profilePicture ? (
                              <div className="relative h-full w-full">
                                <Image
                                  src={member.user?.profilePicture}
                                  alt={`${member.user?.username}'s avatar`}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    // Fallback to initials if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.classList.add(
                                        "bg-primary/10",
                                        "flex",
                                        "items-center",
                                        "justify-center"
                                      );
                                      const fallback =
                                        document.createElement("span");
                                      fallback.className =
                                        "text-primary font-medium text-xs";
                                      fallback.textContent =
                                        member.user?.username.charAt(0);
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                                {member.user?.username.charAt(0)}
                              </div>
                            )}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="mb-6">
              <label className="text-sm font-medium block mb-2">Dates</label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
                {task.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due:</span>
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                {task.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span>
                      {new Date(task.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Creator */}
            <div className="mb-6">
              <label className="text-sm font-medium block mb-2">
                Created by
              </label>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full overflow-hidden">
                  {getMemberById(task.createdBy)?.user?.profilePicture ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={
                          getMemberById(task.createdBy)?.user?.profilePicture ||
                          ""
                        }
                        alt="Creator avatar"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.classList.add(
                              "bg-primary/10",
                              "flex",
                              "items-center",
                              "justify-center"
                            );
                            const fallback = document.createElement("span");
                            fallback.className = "text-primary font-medium";
                            fallback.textContent =
                              getMemberById(
                                task.createdBy
                              )?.user?.username.charAt(0) || "?";
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                      {getMemberById(task.createdBy)?.user?.username.charAt(
                        0
                      ) || "?"}
                    </div>
                  )}
                </div>
                <span className="text-sm">
                  {getMemberById(task.createdBy)?.user?.username}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-6">
              {/* Vote button - show only if task is in TODO and not fully voted */}
              {task.status === "todo" &&
                task.votes &&
                task.votes.length < members.length &&
                !task.votes.some((vote) => vote.memberId === "1") && (
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={() => onVoteTask && onVoteTask(task.id)}
                  >
                    Cast Vote
                  </Button>
                )}

              <Button variant="default" size="sm">
                Edit Task
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                Delete Task
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
