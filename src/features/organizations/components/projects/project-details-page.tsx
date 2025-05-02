"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, useMemo } from "react";
import { TaskModal } from "@/components/tasks/TaskModal";
import {
  OrganizationTask,
  TaskComment,
  ProjectDetails,
  Vote,
} from "@/types/types.organization";
import { ProjectActivityFeed } from "@/components/tasks/ProjectActivityFeed";
import { ProjectActivityService } from "@/services/project-activity.service";
import { useTaskModal } from "@/hooks/use-task-modal";
import {
  ChevronLeft,
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  MessageSquare,
  BarChart2,
  FolderKanban,
  Settings,
  DollarSign,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProjectDetails } from "../../actions/projects/get-project-details";
import DateComponent from "@/components/date-component";
import Content from "@/components/tiptap/content";
import VoteProjectButton from "./vote-project-button";
import { useUser } from "@clerk/nextjs";
export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const organizationId = params?.id as string;

  const { user } = useUser();

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [members, setMembers] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskFilter, setTaskFilter] = useState<string>("all");

  const {
    data: projectData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const project = await getProjectDetails(organizationId, projectId);
      if (project.error) throw new Error(project.error.message);
      return project!.success;
    },
  });

  const handleStatusChange = async (
    taskId: string,
    newStatus: OrganizationTask["status"]
  ) => {
    if (!project) return;

    const timestamp = new Date().toISOString();
    const taskToUpdate = project.tasks.find((task) => task.id === taskId);

    if (!taskToUpdate) return;

    // Check if task has reached quorum (has enough votes and is funded)
    // If not, it cannot be moved from todo
    if (!taskToUpdate.funded && newStatus !== "todo") {
      alert(
        "This task has not reached quorum yet. It cannot be moved from 'To Do' until it gets enough votes and is funded."
      );
      return;
    }

    const updatedTasks = project.tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === "completed" ? timestamp : undefined,
        };
      }
      return task;
    });

    // Create a new activity for status change
    const statusDescription =
      newStatus === "completed"
        ? "Marked"
        : newStatus === "in-progress"
        ? "Started working on"
        : newStatus === "blocked"
        ? "Marked as blocked"
        : "Updated status of";

    // Create activity through the service
    const activityData = {
      type: "status_changed" as const,
      timestamp,
      userId: "1", // Assuming current user is Jane Doe
      taskId,
      description: `${statusDescription} '${taskToUpdate.title}' ${
        newStatus === "completed" ? "as completed" : ""
      }`,
    };

    try {
      const newActivity = await ProjectActivityService.createActivity(
        projectId,
        activityData
      );

      setProject({
        ...project,
        tasks: updatedTasks,
        activities: project.activities
          ? [newActivity, ...project.activities]
          : [newActivity],
      });
    } catch (error) {
      console.error("Failed to create activity:", error);

      // Still update the tasks even if activity creation fails
      setProject({
        ...project,
        tasks: updatedTasks,
      });
    }
  };

  const handleAddComment = async (taskId: string, comment: string) => {
    if (!project) return;

    const timestamp = new Date().toISOString();
    const taskToUpdate = project.tasks.find((task) => task.id === taskId);

    if (!taskToUpdate) return;

    const newComment: TaskComment = {
      id: `comment${Date.now()}`,
      content: comment,
      authorId: "1", // Assuming current user is Jane Doe
      createdAt: timestamp,
    };

    const updatedTasks = project.tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          comments: task.comments
            ? [...task.comments, newComment]
            : [newComment],
        };
      }
      return task;
    });

    // Create activity through the service
    const activityData = {
      type: "comment_added" as const,
      timestamp,
      userId: "1", // Assuming current user is Jane Doe
      taskId,
      description: `Commented on '${taskToUpdate.title}'`,
    };

    try {
      const newActivity = await ProjectActivityService.createActivity(
        projectId,
        activityData
      );

      setProject({
        ...project,
        tasks: updatedTasks,
        activities: project.activities
          ? [newActivity, ...project.activities]
          : [newActivity],
      });
    } catch (error) {
      console.error("Failed to create activity:", error);

      // Still update the tasks even if activity creation fails
      setProject({
        ...project,
        tasks: updatedTasks,
      });
    }
  };

  // Function to handle voting on a task
  const handleVoteTask = async (
    taskId: string,
    voteType: "yes" | "no" = "yes"
  ) => {
    if (!project) return;

    const timestamp = new Date().toISOString();
    const taskToUpdate = project.tasks.find((task) => task.id === taskId);

    if (!taskToUpdate) return;

    // Get the current user ID (for demo purposes, we assume the user is Jane Doe with ID "1")
    const currentUserId = "1";

    // Check if the user has already voted
    const existingVoteIndex = taskToUpdate.votes?.findIndex(
      (vote) => vote.memberId === currentUserId
    );

    let newVotes: Vote[] = [];

    if (existingVoteIndex !== undefined && existingVoteIndex >= 0) {
      // User has already voted, update their vote
      newVotes = [...(taskToUpdate.votes || [])];
      newVotes[existingVoteIndex] = {
        id: `vote_${Date.now()}_${currentUserId}`,
        memberId: currentUserId,
        type: voteType,
        timestamp,
      };
    } else {
      // Add new vote
      newVotes = [
        ...(taskToUpdate.votes || []),
        {
          id: `vote_${Date.now()}_${currentUserId}`,
          memberId: currentUserId,
          type: voteType,
          timestamp,
        },
      ];
    }

    // Count yes votes
    const yesVotes = newVotes.filter((vote) => vote.type === "yes").length;

    // Check if quorum is reached (more than half of team members voted yes)
    const isQuorumReached = yesVotes >= Math.ceil(project.team.length / 2);

    // If quorum is reached and task was not funded before, mark it as funded
    let fundedAt = taskToUpdate.fundedAt;
    let funded = taskToUpdate.funded;

    if (isQuorumReached && !taskToUpdate.funded) {
      funded = true;
      fundedAt = timestamp;
    } else if (!isQuorumReached && taskToUpdate.funded) {
      // If quorum is no longer reached (due to changed votes), mark as unfunded
      funded = false;
      fundedAt = undefined;
    }

    // Update the task
    const updatedTasks = project.tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          votes: newVotes,
          funded,
          fundedAt,
        };
      }
      return task;
    });

    // Create activity for the vote
    const activityData = {
      type: "comment_added" as const, // Using comment_added type for now as we don't have a vote type
      timestamp,
      userId: currentUserId,
      taskId,
      description: `Voted for task '${taskToUpdate.title}'${
        isQuorumReached && !taskToUpdate.funded ? " and reached quorum" : ""
      }`,
    };

    try {
      const newActivity = await ProjectActivityService.createActivity(
        projectId,
        activityData
      );

      setProject({
        ...project,
        tasks: updatedTasks,
        activities: project.activities
          ? [newActivity, ...project.activities]
          : [newActivity],
      });
    } catch (error) {
      console.error("Failed to create activity:", error);

      // Still update the tasks even if activity creation fails
      setProject({
        ...project,
        tasks: updatedTasks,
      });
    }
  };

  const {
    isOpen: isTaskModalOpen,
    activeTask,
    openTaskModal,
    closeTaskModal,
    handleStatusChange: taskModalStatusChange,
    handleCommentAdd: taskModalCommentAdd,
  } = useTaskModal({
    onStatusChange: handleStatusChange,
    onCommentAdd: handleAddComment,
    onVoteTask: handleVoteTask,
  });

  useEffect(() => {
    // In a real application, this would fetch data from an API
    // For now, we'll simulate it with mock data
    const fetchData = async () => {
      setLoading(true);

      // Mock members data
      const mockMembers = [
        {
          id: "1",
          name: "Jane Doe",
          role: "Admin",
          avatar: "/images/avatars/jane-doe.jpg",
        },
        {
          id: "2",
          name: "John Smith",
          role: "Member",
          avatar: "/images/avatars/john-smith.jpg",
        },
        {
          id: "3",
          name: "Alice Johnson",
          role: "Member",
          avatar: "/images/avatars/alice-johnson.jpg",
        },
      ];

      // Fetch activities from the service
      const activitiesResponse =
        await ProjectActivityService.getProjectActivities(projectId);

      // Mock project data
      const mockProject: ProjectDetails = {
        id: projectId,
        name: `Project ${projectId}`,
        description:
          "This is a detailed description of the project. It includes the goals, timeline, and expected outcomes.",
        status: "In Progress",
        startDate: "2025-04-01",
        dueDate: "2025-06-30",
        organizationId,
        team: ["1", "2", "3"],
        activities: activitiesResponse.activities,
        tasks: [
          {
            id: "task1",
            title: "Research competitors",
            description:
              "Analyze top 5 competitors in the market and create a report",
            status: "completed",
            priority: "high",
            assignedTo: "1",
            createdBy: "1",
            createdAt: "2025-04-02",
            dueDate: "2025-04-10",
            completedAt: "2025-04-09",
            effortMinutes: 240, // 4 hours
            votes: [
              {
                id: "vote1",
                memberId: "1",
                type: "yes",
                timestamp: "2025-04-03T10:00:00Z",
              },
              {
                id: "vote2",
                memberId: "2",
                type: "yes",
                timestamp: "2025-04-03T11:30:00Z",
              },
              {
                id: "vote3",
                memberId: "3",
                type: "yes",
                timestamp: "2025-04-03T14:15:00Z",
              },
            ], // All members voted yes
            funded: true,
            fundedAt: "2025-04-04",
            comments: [
              {
                id: "comment1",
                content:
                  "I've started the research, focusing on the top 3 first.",
                authorId: "1",
                createdAt: "2025-04-03",
              },
              {
                id: "comment2",
                content: "Great progress! Let me know if you need any help.",
                authorId: "2",
                createdAt: "2025-04-04",
              },
            ],
          },
          {
            id: "task2",
            title: "Create wireframes",
            description: "Design initial wireframes for the main pages",
            status: "in-progress",
            priority: "medium",
            assignedTo: "2",
            createdBy: "1",
            createdAt: "2025-04-05",
            dueDate: "2025-04-15",
            effortMinutes: 180, // 3 hours
            votes: [
              {
                id: "vote4",
                memberId: "1",
                type: "yes",
                timestamp: "2025-04-05T15:30:00Z",
              },
              {
                id: "vote5",
                memberId: "3",
                type: "yes",
                timestamp: "2025-04-05T16:45:00Z",
              },
            ], // 2 out of 3 members voted
            funded: true,
            fundedAt: "2025-04-06",
          },
          {
            id: "task3",
            title: "Setup development environment",
            description:
              "Configure development tools and environments for the team",
            status: "todo",
            priority: "high",
            assignedTo: "3",
            createdBy: "1",
            createdAt: "2025-04-07",
            dueDate: "2025-04-12",
            effortMinutes: 120, // 2 hours
            votes: [
              {
                id: "vote6",
                memberId: "1",
                type: "yes",
                timestamp: "2025-04-07T13:20:00Z",
              },
            ], // 1 out of 3 members voted
            funded: false,
          },
          {
            id: "task4",
            title: "Create project documentation",
            description:
              "Document project architecture, APIs, and coding standards",
            status: "todo",
            priority: "medium",
            assignedTo: "1",
            createdBy: "1",
            createdAt: "2025-04-08",
            dueDate: "2025-04-20",
            effortMinutes: 300, // 5 hours
            votes: [], // No votes yet
            funded: false,
          },
          {
            id: "task5",
            title: "Implement authentication",
            description: "Develop user authentication and authorization system",
            status: "blocked",
            priority: "high",
            assignedTo: "2",
            createdBy: "1",
            createdAt: "2025-04-10",
            dueDate: "2025-04-25",
            effortMinutes: 480, // 8 hours
            votes: [
              {
                id: "vote7",
                memberId: "1",
                type: "yes",
                timestamp: "2025-04-11T09:15:00Z",
              },
              {
                id: "vote8",
                memberId: "2",
                type: "yes",
                timestamp: "2025-04-11T14:30:00Z",
              },
            ], // 2 out of 3 members voted
            funded: true,
            fundedAt: "2025-04-12",
            comments: [
              {
                id: "comment3",
                content:
                  "Blocked due to pending API access. Will follow up with the team.",
                authorId: "2",
                createdAt: "2025-04-11",
              },
            ],
          },
        ],
      };

      setMembers(mockMembers);
      setProject(mockProject);
      setLoading(false);
    };

    fetchData();
  }, [projectId, organizationId]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !project) return;

    const timestamp = new Date().toISOString();
    const newTaskId = `task${project.tasks.length + 1}`;

    const newTask: OrganizationTask = {
      id: newTaskId,
      title: newTaskTitle,
      status: "todo",
      priority: "medium",
      createdBy: "1", // Assuming current user is Jane Doe
      createdAt: timestamp,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      effortMinutes: 120, // Default to 2 hours effort
    };

    // Create activity through the service
    const activityData = {
      type: "task_created" as const,
      timestamp,
      userId: "1", // Assuming current user is Jane Doe
      taskId: newTaskId,
      description: `Created task '${newTaskTitle}'`,
    };

    try {
      const newActivity = await ProjectActivityService.createActivity(
        projectId,
        activityData
      );

      setProject({
        ...project,
        tasks: [...project.tasks, newTask],
        activities: project.activities
          ? [newActivity, ...project.activities]
          : [newActivity],
      });
    } catch (error) {
      console.error("Failed to create activity:", error);

      // Still update the tasks even if activity creation fails
      setProject({
        ...project,
        tasks: [...project.tasks, newTask],
      });
    }

    setNewTaskTitle("");
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
  const calculateTaskPayment = (task: OrganizationTask) => {
    if (!task.assignedTo || !task.effortMinutes) return 0;

    const hourlyRate = getMemberHourlyRate(task.assignedTo);
    return ((hourlyRate * task.effortMinutes) / 60).toFixed(2);
  };

  const getMemberById = (id?: string) => {
    if (!id) return null;
    return members.find((member: any) => member.id === id) || null;
  };

  const getFilteredTasks = () => {
    if (!project) return [];

    if (taskFilter === "all") return project.tasks;

    return project.tasks.filter((task) => task.status === taskFilter);
  };

  const getTaskStatusIcon = (task: OrganizationTask) => {
    // For tasks in "todo" status that haven't reached quorum yet, show voting arrows
    if (task.status === "todo" && !task.funded) {
      // Check if current user (Jane Doe with ID "1") has already voted
      const hasVoted = task.votes?.some((vote) => vote.memberId === "1");
      const voteType = task.votes?.find((vote) => vote.memberId === "1")?.type;

      return (
        <div className="flex flex-col gap-1">
          <ArrowUpRight
            className={`h-4 w-4 cursor-pointer ${
              hasVoted && voteType === "yes"
                ? "text-green-500 fill-green-500"
                : "text-gray-400"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleVoteTask(task.id, "yes");
            }}
          />
          <ArrowUpRight
            className={`h-4 w-4 rotate-180 cursor-pointer ${
              hasVoted && voteType === "no"
                ? "text-red-500 fill-red-500"
                : "text-gray-400"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleVoteTask(task.id, "no");
            }}
          />
        </div>
      );
    }

    // For other statuses, use the original icons
    switch (task.status) {
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

  const getCompletionPercentage = () => {
    if (!project) return 0;

    const completedTasks = project.tasks.filter(
      (task) => task.status === "completed"
    ).length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  // Helper function to format minutes into a human-readable format
  const formatEffortTime = (minutes: number | undefined) => {
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

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[40vh]">
        <div className="animate-pulse text-xl">Loading project details...</div>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Button
            onClick={() => router.push(`/organizations/${organizationId}`)}
          >
            Back to Organization
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-0 min-h-screen flex flex-col">
      {/* Organization Navigation */}

      <Tabs defaultValue="projects" className="w-full">
        {/* Project Content */}
        <TabsContent value="projects" className="mt-0 flex-1 overflow-auto">
          <div className="py-6 px-6">
            {/* Project Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {projectData?.name}
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    {projectData?.description}
                  </p>

                  <div className="flex flex-col gap-2 pb-5">
                    <p className="font-semibold text-lg">Project Details</p>
                    <div className=" w-full max-w-[90vw]">
                      <Content content={projectData?.description} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <Badge
                      variant={
                        projectData?.status === "VOTING" ? "default" : "outline"
                      }
                    >
                      {projectData?.status}
                    </Badge>

                    {projectData?.status === "VOTING" ? (
                      <span className="text-sm text-muted-foreground">
                        Voting ends in{" "}
                        <DateComponent
                          datetime={projectData?.votingDeadline}
                          type="toDate"
                        />
                      </span>
                    ) : (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(
                            projectData?.createdAt
                          ).toLocaleDateString()}{" "}
                          -
                          {projectData?.projectDeadline
                            ? new Date(
                                projectData?.projectDeadline
                              ).toLocaleDateString()
                            : "Ongoing"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 mb-6">
                    {projectData?.status === "VOTING" ? (
                      <div className="flex items-center gap-4">
                        {projectData?.votes?.some(
                          (vote: any) => vote.voter.user.externalId === user?.id
                        ) ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>You have already voted on this project</span>
                          </div>
                        ) : (
                          <VoteProjectButton project={projectData} />
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{projectData?.votes?.length || 0} votes</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Voting is currently closed for this project
                      </div>
                    )}
                  </div>
                </div>

                {/* <div className="flex flex-col items-end">
                  <div className="flex -space-x-2 mb-2">
                    {projectData?.team.map((memberId) => {
                      const member = getMemberById(memberId);
                      return (
                        <div
                          key={memberId}
                          className="h-8 w-8 rounded-full overflow-hidden border-2 border-background"
                        >
                          {member?.avatar ? (
                            <div className="relative h-full w-full">
                              <Image
                                src={member.avatar}
                                alt={`${member.name}'s avatar`}
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
                                      member.name.charAt(0);
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                              {member?.name.charAt(0) || "?"}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-1" />
                    Manage Team
                  </Button>
                </div> */}
              </div>

              {/* Progress Bar */}
              {projectData?.status === "IN_PROGRESS" && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">
                      {getCompletionPercentage()}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Task Management */}
            {projectData.status !== "VOTING" && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Task List */}
                <div className="lg:col-span-3 flex flex-col h-full overflow-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Tasks</h2>
                    <div className="flex gap-2">
                      <Tabs defaultValue="all" className="w-[400px]">
                        <TabsList>
                          <TabsTrigger
                            value="all"
                            onClick={() => setTaskFilter("all")}
                          >
                            All
                          </TabsTrigger>
                          <TabsTrigger
                            value="todo"
                            onClick={() => setTaskFilter("todo")}
                          >
                            To Do
                          </TabsTrigger>
                          <TabsTrigger
                            value="in-progress"
                            onClick={() => setTaskFilter("in-progress")}
                          >
                            In Progress
                          </TabsTrigger>
                          <TabsTrigger
                            value="completed"
                            onClick={() => setTaskFilter("completed")}
                          >
                            Completed
                          </TabsTrigger>
                          <TabsTrigger
                            value="blocked"
                            onClick={() => setTaskFilter("blocked")}
                          >
                            Blocked
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>

                  {/* Add Task Form */}
                  <div className="flex gap-2 mb-6">
                    <Input
                      placeholder="Add a new task..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateTask();
                      }}
                    />
                    <Button onClick={handleCreateTask}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </div>

                  {/* Task List */}
                  <div className="space-y-4 task-list-container">
                    {getFilteredTasks().map((task) => (
                      <Card
                        key={task.id}
                        className={`cursor-pointer hover:border-primary/50 transition-colors ${
                          activeTask?.id === task.id ? "border-primary" : ""
                        }`}
                        onClick={() => openTaskModal(task)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <button
                                className="mt-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(
                                    task.id,
                                    task.status === "completed"
                                      ? "todo"
                                      : "completed"
                                  );
                                }}
                              >
                                {getTaskStatusIcon(task)}
                              </button>
                              <div>
                                <h3
                                  className={`font-medium ${
                                    task.status === "completed"
                                      ? "line-through text-muted-foreground"
                                      : ""
                                  }`}
                                >
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                  {task.dueDate && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span>
                                        Due{" "}
                                        {new Date(
                                          task.dueDate
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}

                                  {/* Show effort estimate */}
                                  <div className="flex items-center text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                    <span>
                                      {formatEffortTime(task.effortMinutes)}
                                    </span>
                                  </div>

                                  {/* Show voting status */}
                                  <div
                                    className={`flex items-center text-xs px-2 py-0.5 rounded-full ${
                                      task.funded
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                    }`}
                                  >
                                    <span>
                                      {task.votes?.length || 0}/
                                      {projectData?.team.length} votes
                                      {task.funded ? " • Funded" : ""}
                                    </span>
                                  </div>

                                  {/* USDC Payment Amount - only show for funded tasks */}
                                  {task.funded &&
                                    task.assignedTo &&
                                    task.effortMinutes && (
                                      <div className="flex items-center text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full">
                                        <div className="relative h-3 w-3 mr-1">
                                          <Image
                                            src="/images/usdc-icon.png"
                                            alt="USDC"
                                            fill
                                            className="object-contain"
                                          />
                                        </div>
                                        <span>
                                          ${calculateTaskPayment(task)}
                                        </span>
                                      </div>
                                    )}

                                  {task.comments &&
                                    task.comments.length > 0 && (
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        <span>{task.comments.length}</span>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end">
                              {task.assignedTo && (
                                <div className="h-8 w-8 rounded-full overflow-hidden">
                                  {getMemberById(task.assignedTo)?.avatar ? (
                                    <div className="relative h-full w-full">
                                      <Image
                                        src={
                                          getMemberById(task.assignedTo)
                                            ?.avatar || ""
                                        }
                                        alt="Assignee avatar"
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                          // Fallback to initials if image fails to load
                                          const target =
                                            e.target as HTMLImageElement;
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
                                                task.assignedTo
                                              )?.name.charAt(0) || "?";
                                            parent.appendChild(fallback);
                                          }
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                                      {getMemberById(
                                        task.assignedTo
                                      )?.name.charAt(0) || "?"}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {getFilteredTasks().length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No tasks found. Create a new task to get started.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Modal */}
      {activeTask && (
        <TaskModal
          task={activeTask}
          isOpen={isTaskModalOpen}
          onClose={closeTaskModal}
          members={members}
          onStatusChange={handleStatusChange}
          onCommentAdd={handleAddComment}
          onVoteTask={handleVoteTask}
        />
      )}
    </div>
  );
}
