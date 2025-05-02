import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useCachedTokenPricesStore } from "@/store/use-cached-token-prices";
import { getUserNfts } from "@/actions/get/get-user-nfts";
import { UserNft } from "@/types/types.work";
interface UseTokenPriceOptions {
  enabled?: boolean;
  refetchInterval?: number;
}
export const useWalletNFTBalances = (options: UseTokenPriceOptions = {}) => {
  const {
    enabled = true,
    refetchInterval = 30000, // Default refresh every 30 seconds
  } = options;

  const { userId, isLoaded } = useAuth();
  // React Query hook to fetch and revalidate wallet balances
  const { data, error, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [`user-nfts-${userId}`],
    queryFn: async () => {
      const nfts = await getUserNfts();
      if (nfts.error) throw new Error(nfts.error);
      if (nfts.success) return nfts.success as UserNft[];
    },

    enabled: isLoaded && !!userId && enabled,
  });

  return { data, error, isLoading, refetch, isRefetching };
};
