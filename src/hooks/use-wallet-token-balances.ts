import { useQuery } from "@tanstack/react-query";

import { getUserWalletBalance } from "@/actions/get/get-wallet-token-balances";
import { useAuth } from "@clerk/nextjs";
import { useCachedTokenPricesStore } from "@/store/use-cached-token-prices";
import {
  convertMultipleTokenDataToPrices,
  TokenData,
} from "@/utils/token-price";
import { useEffect } from "react";
import useNetwork from "./use-network";
import { useWallet } from "@solana/wallet-adapter-react";
interface UseTokenPriceOptions {
  enabled?: boolean;
  refetchInterval?: number;
}
export const useWalletTokenBalances = (options: UseTokenPriceOptions = {}) => {
  const {
    enabled = true,
    refetchInterval = 30000, // Default refresh every 30 seconds
  } = options;

  const { userId, isLoaded } = useAuth();
  const { publicKey } = useWallet();
  const setMultipleTokenPrices = useCachedTokenPricesStore(
    (state) => state.setMultipleTokenPrices
  );

  // React Query hook to fetch and revalidate wallet balances
  const { data, error, isLoading, refetch, isRefetching } = useQuery<
    TokenData[],
    Error
  >({
    queryKey: ["userTokenList", publicKey?.toString()],
    queryFn: async () => {
      const userTokens = await getUserWalletBalance(
        useNetwork.getState().network,
        publicKey?.toString() ?? ""
      );
      if (userTokens.error) throw new Error(userTokens.error);

      const prices = await convertMultipleTokenDataToPrices(userTokens.success);
      setMultipleTokenPrices(prices);

      return userTokens.success;
    },
    enabled: enabled && !!publicKey,
  });

  useEffect(() => {
    async function setCachedTokenPrices() {
      const prices = await convertMultipleTokenDataToPrices(data!);
      setMultipleTokenPrices(prices);
    }
    if (data) {
      setCachedTokenPrices();
    }
  }, [data]);

  return { data, error, isLoading, refetch, isRefetching };
};
