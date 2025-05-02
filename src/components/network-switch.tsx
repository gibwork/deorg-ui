"use client";
import React from "react";
import { Switch } from "@/components/ui/switch";
import useNetwork from "@/hooks/use-network";

export function NetworkSwitch() {
  const network = useNetwork((state) => state.network);
  const toggleNetwork = useNetwork((state) => state.toggleNetwork);

  if (process.env.NEXT_PUBLIC_NODE_ENV !== "test") return null;

  return (
    <>
      {network}
      <Switch
        checked={network === "devnet"}
        onCheckedChange={() => toggleNetwork()}
      />
    </>
  );
}
