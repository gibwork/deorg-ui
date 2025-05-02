import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTokensList } from "@/actions/get/get-tokens";

interface TokensList {
  lastPage: number;
  page: number;
  limit: number;
  total: number;
  results: TokenDetails[];
}

interface TokenDetails {
  address: string;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
  tags: string[];
  isVerified: boolean;
}

export const useTokenList = () => {
  return useQuery<TokenDetails[], Error>({
    queryKey: ["tokenList"],
    queryFn: async () => {
      const tokens = await getTokensList();

      if (tokens.error) throw new Error(tokens.error);
      return tokens.success.results;
    },
    staleTime: 60 * 60 * 1000, // 1 minute
  });
};
