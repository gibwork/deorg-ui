import { create } from "zustand";
import { persist } from "zustand/middleware";
export interface TokenPrice {
  price: number;
  timestamp: number;
}

export interface TokenPriceResponse {
  price: number;
  mintSymbol?: string;
  vsToken?: string;
  vsTokenSymbol?: string;
}

export interface TokenPricesStore {
  [mintAddress: string]: TokenPrice;
}

export interface TokenInfo {
  mintAddress: string;
  // Add other token properties as needed
}
interface CachedTokenPricesState {
  tokenPrices: TokenPricesStore;
  setTokenPrice: (mintAddress: string, price: number) => void;
  setMultipleTokenPrices: (prices: TokenPricesStore) => void;
  getTokenPrice: (mintAddress: string) => TokenPrice | null;
}

export const useCachedTokenPricesStore = create<CachedTokenPricesState>()(
  persist(
    (set, get) => ({
      tokenPrices: {},
      setTokenPrice: (mintAddress, price) =>
        set((state) => ({
          tokenPrices: {
            ...state.tokenPrices,
            [mintAddress]: { price: price, timestamp: Date.now() },
          },
        })),
      setMultipleTokenPrices: (prices) => {
        set((state) => ({
          tokenPrices: {
            ...state.tokenPrices,
            ...prices,
          },
        }));
      },
      getTokenPrice: (mintAddress) => {
        const state = get();
        return state.tokenPrices[mintAddress] || null;
      },
    }),
    {
      name: "deorg-cached-token-prices",
    }
  )
);
