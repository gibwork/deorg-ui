import { useQuery } from "@tanstack/react-query";
import { getMemberTasks } from "../actions/members/get-member-tasks";
import { Task } from "@/types/types.task";
import { useWallet } from "@solana/wallet-adapter-react";
export function useMemberTasks() {
  const { publicKey } = useWallet();
  return useQuery({
    queryKey: ["member_tasks", publicKey],
    queryFn: async () => {
      const tasks = await getMemberTasks(publicKey?.toString() ?? "");
      if (tasks.error) throw new Error(tasks.error.message);
      return tasks.success as Task[];
    },
    enabled: !!publicKey,
  });
}
