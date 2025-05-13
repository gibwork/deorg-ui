// app/lib/auth.ts
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { walletSignIn } from "@/actions/post/wallet-sign-in";
import { useSignIn, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useTransactionStatus } from "@/hooks/use-transaction-status";

export const useWalletAuth = () => {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const walletModal = useWalletModal();
  const transaction = useTransactionStatus();
  const { signIn, setActive } = useSignIn();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (user || isLoading || !signIn || !setActive) {
      setIsLoading(false);
      return;
    }

    if (!connected || !publicKey || !signMessage) {
      walletModal.setVisible(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      transaction.onStart();
      const message = `Please sign this message to verify your identity: ${publicKey}`;

      const data = new TextEncoder().encode(message);
      const signature = await signMessage(data);

      const { success, error } = await walletSignIn(
        publicKey.toString(),
        btoa(String.fromCharCode(...signature))
      );

      if (error) {
        throw new Error("Authentication failed");
      }

      const { token } = success;
      const signInAttempt = await signIn.create({
        strategy: "ticket",
        ticket: token as string,
      });
      if (signInAttempt.status === "complete") {
        setActive({
          session: signInAttempt.createdSessionId,
        });
      } else {
        // If the sign-in attempt is not complete, check why.
        // User may need to complete further steps.
        // console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      disconnect();
      toast.error((err as Error).message);
    } finally {
      setIsLoading(false);
      transaction.onEnd();
    }
  };

  useEffect(() => {
    const body = document.body;

    if (walletModal.visible) {
      body.style.pointerEvents = "auto";
    }

    return () => {
      body.style.pointerEvents = "";
    };
  }, [walletModal]);

  useEffect(() => {
    if (connected && publicKey) {
      handleSignIn();
    }
  }, [connected, publicKey]);

  return {
    isLoading,
    error,
    handleSignIn,
  };
};
