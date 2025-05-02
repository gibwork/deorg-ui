import { getPriceFromTokenMintAddress } from "@/actions/get/get-wallet-token-balances";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useState, useEffect, useCallback } from "react";

interface TokenInfo {
  mintAddress: string;
  // Add other token properties as needed
}

interface UsePlatformFeeProps {
  selectedTokenAddress: string | null;
  depositAmount: number;
}

interface UsePlatformFeeResult {
  tokenPrice?: number;
  solPrice?: number;
  platformFee: number | null;
  isLoading: boolean;
  error: string | null;
  calculatePlatformFee: () => void;
}

export const usePlatformFee = ({
  selectedTokenAddress,
  depositAmount,
}: UsePlatformFeeProps): UsePlatformFeeResult => {
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    data: tokenPrice,
    isLoading: isPriceLoading,
    error: priceError,
  } = useTokenPrice(selectedTokenAddress!, { enabled: !!selectedTokenAddress });

  const {
    data: solPrice,
    isLoading: isSolPriceLoading,
    error: solPriceError,
  } = useTokenPrice("So11111111111111111111111111111111111111112");

  const calculatePlatformFee = useCallback(() => {
    if (
      !selectedTokenAddress ||
      !tokenPrice?.price ||
      !depositAmount ||
      !solPrice?.price
    ) {
      setPlatformFee(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const totalValue = tokenPrice?.price * depositAmount;

      // Validate minimum deposit
      if (totalValue < 10) {
        setError("The deposit amount must be more than 10 USDC");
      }

      // Calculate 5% fee
      const fee = totalValue * (5 / 100);

      // Calculate fee in SOL with fallback
      const solAmount = solPrice?.price
        ? Number((fee / solPrice?.price).toFixed(5))
        : 0.005;

      setPlatformFee(solAmount);
    } catch (err) {
      // console.error("Error calculating platform fee:", err);
      // setError("Failed to calculate platform fee");
      setPlatformFee(0);
    } finally {
      setLoading(false);
    }
  }, [selectedTokenAddress, depositAmount, tokenPrice, solPrice]);

  useEffect(() => {
    calculatePlatformFee();
  }, [calculatePlatformFee]);

  const isLoading = isPriceLoading || isSolPriceLoading || loading;

  return {
    tokenPrice: tokenPrice?.price,
    solPrice: solPrice?.price,
    platformFee,
    isLoading,
    error,
    calculatePlatformFee,
  };
};
