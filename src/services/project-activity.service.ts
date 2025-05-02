import { ProjectActivity, Member } from "@/types/types.organization";

// Mock data for project activities
const mockActivitiesData: Record<string, ProjectActivity[]> = {
  // Project 1 activities
  "1": [
    {
      id: "activity1_1",
      type: "task_created",
      timestamp: "2025-04-02T10:30:00Z",
      userId: "1",
      taskId: "task1",
      description: "Created task 'Research competitors'"
    },
    {
      id: "activity1_2",
      type: "task_assigned",
      timestamp: "2025-04-02T10:35:00Z",
      userId: "1",
      taskId: "task1",
      description: "Assigned 'Research competitors' to Jane Doe"
    },
    {
      id: "activity1_3",
      type: "comment_added",
      timestamp: "2025-04-03T14:20:00Z",
      userId: "1",
      taskId: "task1",
      description: "Commented on 'Research competitors'"
    },
    {
      id: "activity1_4",
      type: "comment_added",
      timestamp: "2025-04-04T09:15:00Z",
      userId: "2",
      taskId: "task1",
      description: "Commented on 'Research competitors'"
    },
    {
      id: "activity1_5",
      type: "status_changed",
      timestamp: "2025-04-09T16:45:00Z",
      userId: "1",
      taskId: "task1",
      description: "Marked 'Research competitors' as completed"
    },
    {
      id: "activity1_6",
      type: "task_created",
      timestamp: "2025-04-05T11:20:00Z",
      userId: "1",
      taskId: "task2",
      description: "Created task 'Create wireframes'"
    },
    {
      id: "activity1_7",
      type: "task_assigned",
      timestamp: "2025-04-05T11:25:00Z",
      userId: "1",
      taskId: "task2",
      description: "Assigned 'Create wireframes' to John Smith"
    },
    {
      id: "activity1_8",
      type: "status_changed",
      timestamp: "2025-04-06T13:10:00Z",
      userId: "2",
      taskId: "task2",
      description: "Started working on 'Create wireframes'"
    }
  ],
  
  // Project 2 activities
  "2": [
    {
      id: "activity2_1",
      type: "task_created",
      timestamp: "2025-04-01T09:00:00Z",
      userId: "1",
      taskId: "task1",
      description: "Created task 'Design system architecture'"
    },
    {
      id: "activity2_2",
      type: "task_assigned",
      timestamp: "2025-04-01T09:05:00Z",
      userId: "1",
      taskId: "task1",
      description: "Assigned 'Design system architecture' to Alice Johnson"
    },
    {
      id: "activity2_3",
      type: "status_changed",
      timestamp: "2025-04-03T11:30:00Z",
      userId: "3",
      taskId: "task1",
      description: "Started working on 'Design system architecture'"
    },
    {
      id: "activity2_4",
      type: "comment_added",
      timestamp: "2025-04-05T15:45:00Z",
      userId: "3",
      taskId: "task1",
      description: "Commented on 'Design system architecture'"
    }
  ],
  
  // Project 3 activities
  "3": [
    {
      id: "activity3_1",
      type: "task_created",
      timestamp: "2025-04-10T08:30:00Z",
      userId: "2",
      taskId: "task1",
      description: "Created task 'Market research'"
    },
    {
      id: "activity3_2",
      type: "task_assigned",
      timestamp: "2025-04-10T08:35:00Z",
      userId: "2",
      taskId: "task1",
      description: "Assigned 'Market research' to John Smith"
    },
    {
      id: "activity3_3",
      type: "status_changed",
      timestamp: "2025-04-11T10:15:00Z",
      userId: "2",
      taskId: "task1",
      description: "Started working on 'Market research'"
    }
  ]
};

// Additional system activities that can be mixed in
const systemActivities: ProjectActivity[] = [
  {
    id: "sys_activity1",
    type: "status_changed",
    timestamp: "2025-04-12T09:00:00Z",
    userId: "1",
    description: "Updated project status to 'In Progress'"
  },
  {
    id: "sys_activity2",
    type: "status_changed",
    timestamp: "2025-04-05T16:30:00Z",
    userId: "1",
    description: "Updated project deadline to June 30, 2025"
  },
  {
    id: "sys_activity3",
    type: "task_assigned",
    timestamp: "2025-04-08T11:45:00Z",
    userId: "1",
    description: "Added Alice Johnson to the project team"
  },
  {
    id: "sys_activity4",
    type: "status_changed",
    timestamp: "2025-04-15T14:20:00Z",
    userId: "2",
    description: "Updated project description"
  }
];

// Interface for activity query parameters
export interface ActivityQueryParams {
  limit?: number;
  offset?: number;
  type?: ProjectActivity["type"];
  userId?: string;
  taskId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "timestamp" | "type";
  sortOrder?: "asc" | "desc";
}

// Interface for activity response
export interface ActivityResponse {
  activities: ProjectActivity[];
  total: number;
  hasMore: boolean;
}

/**
 * Service for managing project activities
 * This mimics a real API service and can be easily replaced with actual API calls in the future
 */
export class ProjectActivityService {
  /**
   * Get activities for a specific project
   * @param projectId - The ID of the project
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with activity data
   */
  static async getProjectActivities(
    projectId: string,
    params: ActivityQueryParams = {}
  ): Promise<ActivityResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get base activities for this project
    let activities = [...(mockActivitiesData[projectId] || [])];
    
    // Add some system activities
    if (projectId in mockActivitiesData) {
      // Only add system activities if we have project activities
      activities = [...activities, ...systemActivities.map(activity => ({
        ...activity,
        id: `${activity.id}_${projectId}`
      }))];
    }
    
    // Apply filters
    if (params.type) {
      activities = activities.filter(activity => activity.type === params.type);
    }
    
    if (params.userId) {
      activities = activities.filter(activity => activity.userId === params.userId);
    }
    
    if (params.taskId) {
      activities = activities.filter(activity => activity.taskId === params.taskId);
    }
    
    if (params.startDate) {
      const startDate = new Date(params.startDate).getTime();
      activities = activities.filter(activity => new Date(activity.timestamp).getTime() >= startDate);
    }
    
    if (params.endDate) {
      const endDate = new Date(params.endDate).getTime();
      activities = activities.filter(activity => new Date(activity.timestamp).getTime() <= endDate);
    }
    
    // Sort activities
    const sortBy = params.sortBy || "timestamp";
    const sortOrder = params.sortOrder || "desc";
    
    activities.sort((a, b) => {
      if (sortBy === "timestamp") {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "type") {
        return sortOrder === "asc" 
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
      return 0;
    });
    
    // Apply pagination
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const total = activities.length;
    
    activities = activities.slice(offset, offset + limit);
    
    return {
      activities,
      total,
      hasMore: offset + limit < total
    };
  }
  
  /**
   * Create a new activity for a project
   * @param projectId - The ID of the project
   * @param activity - The activity to create
   * @returns Promise with the created activity
   */
  static async createActivity(
    projectId: string,
    activity: Omit<ProjectActivity, "id">
  ): Promise<ProjectActivity> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newActivity: ProjectActivity = {
      ...activity,
      id: `activity${Date.now()}`
    };
    
    // Add to mock data
    if (!mockActivitiesData[projectId]) {
      mockActivitiesData[projectId] = [];
    }
    
    mockActivitiesData[projectId].unshift(newActivity);
    
    return newActivity;
  }
  
  /**
   * Get recent activities across all projects
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with activity data
   */
  static async getRecentActivities(
    params: ActivityQueryParams = {}
  ): Promise<ActivityResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Combine all project activities
    let activities: ProjectActivity[] = [];
    Object.values(mockActivitiesData).forEach(projectActivities => {
      activities = [...activities, ...projectActivities];
    });
    
    // Add system activities
    activities = [...activities, ...systemActivities];
    
    // Apply filters (same as getProjectActivities)
    if (params.type) {
      activities = activities.filter(activity => activity.type === params.type);
    }
    
    if (params.userId) {
      activities = activities.filter(activity => activity.userId === params.userId);
    }
    
    if (params.taskId) {
      activities = activities.filter(activity => activity.taskId === params.taskId);
    }
    
    if (params.startDate) {
      const startDate = new Date(params.startDate).getTime();
      activities = activities.filter(activity => new Date(activity.timestamp).getTime() >= startDate);
    }
    
    if (params.endDate) {
      const endDate = new Date(params.endDate).getTime();
      activities = activities.filter(activity => new Date(activity.timestamp).getTime() <= endDate);
    }
    
    // Sort activities
    const sortBy = params.sortBy || "timestamp";
    const sortOrder = params.sortOrder || "desc";
    
    activities.sort((a, b) => {
      if (sortBy === "timestamp") {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "type") {
        return sortOrder === "asc" 
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
      return 0;
    });
    
    // Apply pagination
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const total = activities.length;
    
    activities = activities.slice(offset, offset + limit);
    
    return {
      activities,
      total,
      hasMore: offset + limit < total
    };
  }
}
