"use client";

import * as React from "react";
import { ClerkProvider as ClerkAuthProvider } from "@clerk/nextjs";
import { dark, neobrutalism } from "@clerk/themes";
import { useTheme } from "next-themes";
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <ClerkAuthProvider
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
        variables: {
          colorBackground: resolvedTheme === "dark" ? "transparent" : "#fff",
        },
      }}
    >
      {children}
    </ClerkAuthProvider>
  );
}
