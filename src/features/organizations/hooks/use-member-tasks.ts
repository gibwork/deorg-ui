import { useQuery } from "@tanstack/react-query";
import { Organization } from "@/types/types.organization";
import { getMemberOrganizations } from "../actions/members/get-member-organizations";
import { useAuth } from "@clerk/nextjs";
import { getMemberTasks } from "../actions/members/get-member-tasks";
import { Task } from "@/types/types.task";

export function useMemberTasks() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ["member_tasks", userId],
    queryFn: async () => {
      const tasks = await getMemberTasks();
      if (tasks.error) throw new Error(tasks.error.message);
      return tasks.success as Task[];
    },
    enabled: !!userId,
  });
}
