import { getPriceFromTokenMintAddress } from "@/actions/get/get-wallet-token-balances";
import { useCachedTokenPricesStore } from "@/store/use-cached-token-prices";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TokenPrice {
  price: number;
  mintSymbol?: string;
  vsToken?: string;
  vsTokenSymbol?: string;
}

interface UseTokenPriceOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export const useTokenPrice = (
  mintAddress: string | undefined,
  options: UseTokenPriceOptions = {}
) => {
  const {
    enabled = true,
    refetchInterval = 30000, // Default refresh every 30 seconds
  } = options;

  const { getTokenPrice, setTokenPrice } = useCachedTokenPricesStore();
  const queryClient = useQueryClient();

  return useQuery<TokenPrice, Error>({
    queryKey: ["tokenPrice", mintAddress],
    queryFn: async () => {
      if (!mintAddress) throw new Error("Mint address is required");

      // Check cache first
      const cachedPrice = getTokenPrice(mintAddress);
      if (cachedPrice) {
        // Check if price is stale (older than 5 minutes)
        if (Date.now() - cachedPrice.timestamp < 300000) {
          return { price: cachedPrice.price };
        }
      }

      // Fetch new price
      const price = await getPriceFromTokenMintAddress(mintAddress);
      setTokenPrice(mintAddress, price);
      return {
        price,
      };
    },
    enabled: Boolean(mintAddress) && enabled,
    refetchInterval,
    staleTime: 30000,
  });
};
