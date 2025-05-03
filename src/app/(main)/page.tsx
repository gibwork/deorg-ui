"use client";

import { LoaderButton } from "@/components/loader-button";
import { Button } from "@/components/ui/button";
import { useWalletAuth } from "@/features/auth/lib/wallet-auth";
import { WalletIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/organizations");
}
