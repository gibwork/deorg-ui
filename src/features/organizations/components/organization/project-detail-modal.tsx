"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, CheckCircle2, Clock, ListChecks, PlusCircle, ThumbsDown, ThumbsUp, Users } from "lucide-react"
import { CreateTaskModal } from "./create-task-modal"
import { ApplyToProjectModal } from "./apply-to-project-modal"

interface ProjectDetailModalProps {
  isOpen: boolean
  onClose: () => void
  project: any
}

export function ProjectDetailModal({ isOpen, onClose, project }: ProjectDetailModalProps) {
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)

  // Mock data for project tasks
  const tasks = [
    {
      id: 1,
      title: "Design UI Mockups",
      description: "Create mockups for the new UI design",
      status: "completed",
      assignee: {
        name: "Alice",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      dueDate: "2023-06-15",
      reward: 50,
    },
    {
      id: 2,
      title: "Implement Header Component",
      description: "Create the new header component based on the design",
      status: "in_progress",
      assignee: {
        name: "Bob",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      dueDate: "2023-06-25",
      reward: 75,
    },
    {
      id: 3,
      title: "Implement Footer Component",
      description: "Create the new footer component based on the design",
      status: "open",
      assignee: null,
      dueDate: "2023-07-05",
      reward: 60,
    },
  ]

  // Mock data for project votes
  const votes = [
    {
      voter: {
        name: "Alice",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      vote: "for",
      timestamp: "2023-06-01 14:32",
      comment: "This project is essential for improving our user experience.",
    },
    {
      voter: {
        name: "Bob",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      vote: "for",
      timestamp: "2023-06-01 15:45",
      comment: "I agree, our UI needs a refresh.",
    },
    {
      voter: {
        name: "Charlie",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      vote: "against",
      timestamp: "2023-06-02 09:10",
      comment: "I think we should focus on backend improvements first.",
    },
    {
      voter: {
        name: "Dave",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      vote: "for",
      timestamp: "2023-06-02 11:25",
      comment: "The design looks great, I support this project.",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{project.title}</DialogTitle>
          <DialogDescription>{project.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-3 mt-2">
          <Badge
            variant="outline"
            className={`
              ${project.status === "pending_approval" ? "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400" : ""}
              ${project.status === "in_progress" ? "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400" : ""}
              ${project.status === "completed" ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400" : ""}
            `}
          >
            {project.status === "pending_approval"
              ? "Pending Approval"
              : project.status === "in_progress"
                ? "In Progress"
                : project.status === "completed"
                  ? "Completed"
                  : project.status}
          </Badge>

          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </Badge>

          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {project.contributors.length} Contributors
          </Badge>
        </div>

        {project.status !== "pending_approval" && (
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        )}

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="voting">Voting</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Budget</CardTitle>
                  <CardDescription>Project funding and spending</CardDescription>
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
                      <span className="text-green-600 dark:text-green-400">{project.budget - project.spent} SOL</span>
                    </div>
                    <Progress value={(project.spent / project.budget) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contributors</CardTitle>
                  <CardDescription>Team members working on this project</CardDescription>
                </CardHeader>
                <CardContent>
                  {project.contributors.length > 0 ? (
                    <div className="space-y-4">
                      {project.contributors.map((contributor: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={contributor.avatar || "/placeholder.svg"} alt={contributor.name} />
                            <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{contributor.name}</p>
                            <p className="text-sm text-muted-foreground">Contributor</p>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setShowApplyModal(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Apply to Join
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground mb-4">No contributors yet</p>
                      <Button onClick={() => setShowApplyModal(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Apply to Join
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
                <CardDescription>Key metrics and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tasks</p>
                    <p className="text-2xl font-bold">
                      {project.tasks.completed}/{project.tasks.total}
                    </p>
                    <p className="text-sm text-muted-foreground">Tasks completed</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Milestones</p>
                    <p className="text-2xl font-bold">
                      {project.milestones.filter((m: any) => m.status === "completed").length}/
                      {project.milestones.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Milestones completed</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="text-2xl font-bold">{getDaysRemaining(project.endDate)}</p>
                    <p className="text-sm text-muted-foreground">Days remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Project Tasks</h3>
              {project.status !== "pending_approval" && (
                <Button size="sm" onClick={() => setShowCreateTaskModal(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        <TaskStatusBadge status={task.status} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{task.description}</p>
                      <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center gap-2">
                          {task.assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={task.assignee.avatar || "/placeholder.svg"}
                                  alt={task.assignee.name}
                                />
                                <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{task.assignee.name}</span>
                            </div>
                          ) : (
                            <Badge variant="outline">Unassigned</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Due {formatDate(task.dueDate)}</span>
                          </div>
                          <div className="text-sm font-medium">{task.reward} SOL</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <ListChecks className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">No tasks created yet</p>
                {project.status !== "pending_approval" && (
                  <Button onClick={() => setShowCreateTaskModal(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create First Task
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4 mt-4">
            <h3 className="text-lg font-medium">Project Milestones</h3>
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
                        <p className="text-sm text-muted-foreground">Due {formatDate(milestone.dueDate)}</p>
                      </div>
                    </div>
                    <MilestoneStatusBadge status={milestone.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="voting" className="space-y-4 mt-4">
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
                      {Math.round((project.votingStatus.votesFor / project.votingStatus.totalVotes) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(project.votingStatus.votesFor / project.votingStatus.totalVotes) * 100}
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

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Votes & Comments</h3>
              {votes.map((vote, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={vote.voter.avatar || "/placeholder.svg"} alt={vote.voter.name} />
                        <AvatarFallback>{vote.voter.name.charAt(0)}</AvatarFallback>
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
                        <p className="text-xs text-muted-foreground mt-2">{vote.timestamp}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <CreateTaskModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          onSubmit={(data) => {
            console.log("Creating task with data:", data)
            setShowCreateTaskModal(false)
          }}
        />

        <ApplyToProjectModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSubmit={(data) => {
            console.log("Applying to project with data:", data)
            setShowApplyModal(false)
          }}
          project={project}
        />
      </DialogContent>
    </Dialog>
  )
}

function TaskStatusBadge({ status }: { status: string }) {
  let className = "px-2.5 py-0.5 text-xs font-medium rounded-full "

  switch (status) {
    case "open":
      className += "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      break
    case "in_progress":
      className += "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      break
    case "completed":
      className += "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      break
    default:
      className += "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  const statusMap: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    completed: "Completed",
  }

  return <span className={className}>{statusMap[status] || status}</span>
}

function MilestoneStatusBadge({ status }: { status: string }) {
  let className = "px-2.5 py-0.5 text-xs font-medium rounded-full "

  switch (status) {
    case "not_started":
      className += "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      break
    case "in_progress":
      className += "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      break
    case "completed":
      className += "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      break
    default:
      className += "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  const statusMap: Record<string, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    completed: "Completed",
  }

  return <span className={className}>{statusMap[status] || status}</span>
}

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Helper function to calculate days remaining
function getDaysRemaining(endDateString: string) {
  const endDate = new Date(endDateString)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}
