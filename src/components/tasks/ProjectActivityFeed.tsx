"use client";

import { ProjectActivity, Member } from "@/types/types.organization";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  CheckCircle2,
  Circle,
  AlertCircle,
  UserPlus,
  Plus,
  Clock,
  RefreshCw,
  Filter,
} from "lucide-react";

interface ProjectActivityFeedProps {
  activities: ProjectActivity[];
  members: Member[];
  limit?: number;
}

export function ProjectActivityFeed({
  activities,
  members,
  limit = 20,
}: ProjectActivityFeedProps) {
  const [typeFilter, setTypeFilter] = useState<ProjectActivity["type"] | "all">(
    "all"
  );
  const [userFilter, setUserFilter] = useState<string | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const getMemberById = (id: string) => {
    return members.find((member) => member.id === id) || null;
  };

  const getActivityIcon = (type: ProjectActivity["type"]) => {
    switch (type) {
      case "task_created":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "task_assigned":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "comment_added":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "status_changed":
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Filter and sort activities
  const filteredActivities = [...activities]
    .filter((activity) => {
      // Apply type filter
      if (typeFilter !== "all" && activity.type !== typeFilter) {
        return false;
      }

      // Apply user filter
      if (userFilter !== "all" && activity.userId !== userFilter) {
        return false;
      }

      return true;
    })
    .sort(
      (a, b) =>
        // Sort by timestamp (newest first)
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit); // Limit the number of activities shown

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Activity</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="h-8 px-2"
        >
          <Filter className="h-4 w-4 mr-1" />
          Filter
        </Button>
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="p-3 bg-muted/30 rounded-md space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Activity Type
              </label>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="task_created">Task Created</SelectItem>
                  <SelectItem value="task_assigned">Task Assigned</SelectItem>
                  <SelectItem value="comment_added">Comment Added</SelectItem>
                  <SelectItem value="status_changed">Status Changed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Team Member
              </label>
              <Select
                value={userFilter}
                onValueChange={(value) => setUserFilter(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {members.map((member: any) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTypeFilter("all");
                setUserFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {filteredActivities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No recent activity
        </div>
      ) : (
        <div
          className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)] scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filteredActivities.map((activity) => {
            const member = getMemberById(activity.userId);
            if (!member) return null;

            return (
              <div
                key={activity.id}
                className="flex gap-3 p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    <div className="relative h-full w-full">
                      <Image
                        src={member.user.profilePicture}
                        alt={`${member.user.username}'s avatar`}
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
                              member?.user.username.charAt(0) || "?";
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Activity Content */}
                <div className="flex-grow">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium text-sm">
                      {member?.user.firstName}
                    </span>
                    <div className="bg-muted rounded-full p-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm">{activity.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
