import { useQuery } from "@tanstack/react-query";
import { getUserData } from "@/actions/get/get-user-data";
import { useAuth } from "@clerk/nextjs";
export const useUserData = () => {
  const { userId } = useAuth();
  const { data, error, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [`user-${userId}`],
    queryFn: async () => {
      const result = await getUserData();
      if (result.error) throw new Error(result.error);
      return result.success;
    },
    enabled: !!userId,
  });

  return { data, error, isLoading, refetch, isRefetching };
};
