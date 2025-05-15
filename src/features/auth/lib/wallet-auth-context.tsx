"use client";
import { createContext, useContext, ReactNode } from "react";
import { useWalletAuth } from "./wallet-auth";

const WalletAuthContext = createContext<ReturnType<
  typeof useWalletAuth
> | null>(null);

export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const walletAuth = useWalletAuth();

  return (
    <WalletAuthContext.Provider value={walletAuth}>
      {children}
    </WalletAuthContext.Provider>
  );
}

export function useWalletAuthContext() {
  const context = useContext(WalletAuthContext);
  if (!context) {
    throw new Error(
      "useWalletAuthContext must be used within a WalletAuthProvider"
    );
  }
  return context;
}
