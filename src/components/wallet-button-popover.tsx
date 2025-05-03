"use client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { truncate } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { Copy, UnplugIcon, WalletMinimalIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { Icons } from "./icons";
import { toast } from "sonner";
import useNetwork from "@/hooks/use-network";
import { useAuth } from "@clerk/nextjs";
import { User } from "@/types/user.types";

export function WalletButtonPopover({ userData }: { userData?: User }) {
  const { publicKey, disconnect } = useWallet();

  const { signOut } = useAuth();
  const network = useNetwork((state) => state.network);

  if (publicKey)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="text-sm h-7 md:h-9 flex items-center !p-1 md:!px-4 md:gap-2"
          >
            <WalletMinimalIcon className="p-1" />
            <span className="hidden md:block">
              {" "}
              {truncate(publicKey.toString(), 5, 3)}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="grid gap-4">
            <div className="flex items-center justify-start border rounded-lg w-fit text-muted-foreground ">
              <input
                className="w-44 rounded-l-md p-1.5 focus:outline-none text-sm  "
                disabled
                value={truncate(publicKey.toString())}
              />
              <Separator orientation="vertical" />
              <Button
                variant="link"
                size="xs"
                className="px-3"
                onClick={() => {
                  navigator.clipboard.writeText(publicKey.toString()).then(
                    function () {
                      /* clipboard successfully set */
                      toast.success("Copied to clipboard");
                    },
                    function () {
                      /* clipboard write failed */
                      toast.error("Failed to copy to clipboard");
                    }
                  );
                }}
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" />
              <Link
                href={`https://explorer.solana.com/address/${publicKey.toString()}?cluster=${network}`}
                prefetch={false}
                rel="noopener noreferrer"
                target="_blank"
                className="flex items-center gap-1"
              >
                <span className="sr-only">View in explorer</span>
                <Icons.explorer className="mx-2 h-4 w-4" />
              </Link>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  disconnect();

                  if (userData?.walletAddress) {
                    signOut();
                  }

                }}
              >
                <UnplugIcon className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
}
