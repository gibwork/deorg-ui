// app/lib/auth.ts
import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { walletSignIn } from "@/actions/post/wallet-sign-in";
import { useAuth, useSignIn, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { verifyPrimaryWallet } from "@/actions/post/verify-primary-wallet";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletChange } from "./use-wallet-change";

export const useVerifyWallet = () => {
  const { userId } = useAuth();
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const walletModal = useWalletModal();
  const queryClient = useQueryClient();
  const { isManualChange, toggleManualChange, isVerifying, toggleVerifying } =
    useWalletChange();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    if (isLoading || !isVerifying) {
      return;
    }

    if (!connected || !publicKey || !signMessage) {
      //   walletModal.setVisible(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const message = `Please sign this message to verify your identity: ${publicKey}`;

      const data = new TextEncoder().encode(message);
      const signature = await signMessage(data);
      toast.loading("verifying wallet...");
      const { success, error } = await verifyPrimaryWallet(
        publicKey.toString(),
        btoa(String.fromCharCode(...signature))
      );

      if (error) {
        setError(error.message);
        throw new Error(error.message);
      }
      await queryClient.invalidateQueries({
        queryKey: [`user-${userId}`],
      });
      toast.success(success);
    } catch (err) {
      disconnect();
      toast.error((err as Error).message);
    } finally {
      toast.dismiss();
      setIsLoading(false);
      toggleVerifying(false);
    }
  }, [publicKey]);
  return {
    isLoading,
    error,
    handleVerify,
  };
};
