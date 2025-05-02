import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, FileText, ListChecks, Users, DollarSign, Vote } from "lucide-react"

export function OrganizationActivity() {
  // Mock data for activity feed
  const activities = [
    {
      id: 1,
      type: "proposal",
      title: "Frontend Redesign Proposal Created",
      description: "Alice created a new proposal for frontend redesign.",
      user: {
        name: "Alice",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "vote",
      title: "Vote on Smart Contract Audit",
      description: "Bob voted in favor of the smart contract audit proposal.",
      user: {
        name: "Bob",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      type: "task",
      title: "Task Completed",
      description: "Charlie completed the 'Implement Wallet Connect' task.",
      user: {
        name: "Charlie",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      timestamp: "1 day ago",
    },
    {
      id: 4,
      type: "member",
      title: "New Member Joined",
      description: "Dave joined the organization as a member.",
      user: {
        name: "Dave",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      timestamp: "2 days ago",
    },
    {
      id: 5,
      type: "payment",
      title: "Payment Sent",
      description: "25 SOL was paid to Bob for completing the landing page design.",
      user: {
        name: "Alice",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      timestamp: "3 days ago",
    },
    {
      id: 6,
      type: "proposal",
      title: "Proposal Approved",
      description: "The marketing campaign proposal was approved by the contributors.",
      user: {
        name: "System",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      timestamp: "4 days ago",
    },
    {
      id: 7,
      type: "role",
      title: "Role Change",
      description: "Charlie was promoted from Member to Contributor.",
      user: {
        name: "Alice",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      timestamp: "5 days ago",
    },
  ]

  // Helper function to get the appropriate icon for each activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "proposal":
        return <FileText className="h-5 w-5" />
      case "vote":
        return <Vote className="h-5 w-5" />
      case "task":
        return <ListChecks className="h-5 w-5" />
      case "member":
        return <Users className="h-5 w-5" />
      case "payment":
        return <DollarSign className="h-5 w-5" />
      case "role":
        return <Users className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  // Helper function to get the appropriate background color for each activity type
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case "proposal":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "vote":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      case "task":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "member":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      case "payment":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "role":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Activity Feed</h2>
        <p className="text-muted-foreground">Recent activity in your organization.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Activity</CardTitle>
          <CardDescription>A chronological log of all actions taken within the organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className={`rounded-full p-2 ${getActivityBgColor(activity.type)} flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                      <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
