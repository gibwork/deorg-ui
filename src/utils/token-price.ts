import { TokenPricesStore } from "@/store/use-cached-token-prices";

export interface PriceInfo {
  price_per_token: number;
  total_price: number;
  currency: string;
}

export interface TokenInfo {
  balance: number;
  supply: number;
  decimals: number;
  token_program: string;
  associated_token_address: string;
  price_info: PriceInfo;
}

export interface TokenData {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  tokenInfo: TokenInfo;
}

export const convertTokenDataToPrice = (
  tokenData: TokenData
): TokenPricesStore => {
  const { address, tokenInfo } = tokenData;

  return {
    [address]: {
      price: tokenInfo?.price_info?.price_per_token ?? 0,
      timestamp: Date.now(),
    },
  };
};

export const convertMultipleTokenDataToPrices = async (
  tokenDataArray: TokenData[]
): Promise<TokenPricesStore> => {
  return tokenDataArray.reduce((acc, tokenData) => {
    const priceData = convertTokenDataToPrice(tokenData);
    return {
      ...acc,
      ...priceData,
    };
  }, {});
};
