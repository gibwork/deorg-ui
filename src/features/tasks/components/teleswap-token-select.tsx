"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getMultichainTokensList } from "@/actions/get/get-multichain-tokens-list";
import { useQuery } from "@tanstack/react-query";
import { MultichainToken } from "@/types/teleswap.types";

export function TeleswapTokenSelect({
  selectedCoin,
  setSelectedCoin,
}: {
  selectedCoin: string;
  setSelectedCoin: React.Dispatch<
    React.SetStateAction<{ name: string; symbol: string; network: string }>
  >;
}) {
  const [open, setOpen] = React.useState(false);

  const {
    data: tokensList,
    isLoading: isTokensListLoading,
    error,
  } = useQuery({
    queryKey: ["multiChainTokensList"],
    queryFn: async () => {
      const { success, error } = await getMultichainTokensList();
      if (error) throw new Error(error.message);
      if (success) return success as MultichainToken[];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] lg:w-[400px] justify-between"
        >
          {tokensList ? (
            <span className="flex gap-2">
              <Avatar className="size-5">
                <AvatarImage
                  src={
                    tokensList?.find((token) => token.symbol === selectedCoin)
                      ?.img
                  }
                  className="size-5"
                />
                <AvatarFallback></AvatarFallback>
              </Avatar>
              {selectedCoin
                ? tokensList?.find((token) => token.symbol === selectedCoin)
                    ?.name
                : "Select Coin"}
              <span className="bg-muted-foreground/10 dark:bg-muted-foreground/30 text-muted-foreground rounded-md px-2 text-sm capitalize">
                {selectedCoin
                  ? tokensList?.find((token) => token.symbol === selectedCoin)
                      ?.network
                  : ""}
              </span>
            </span>
          ) : (
            "Select Coin"
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search coin..." />
          <CommandList>
            <CommandEmpty>No coin found.</CommandEmpty>
            <CommandGroup className="max-h-60 md:max-h-72 overflow-y-scroll overflow-x-hidden no-scrollbar">
              {tokensList?.map((token) => (
                <CommandItem
                  key={token.id}
                  value={token.symbol}
                  onSelect={(currentValue) => {
                    setSelectedCoin({
                      name: token.name,
                      symbol: currentValue,
                      network: token.network,
                    });
                    setOpen(false);
                  }}
                  className="flex items-center justify-between cursor-pointer p-2"
                >
                  <div className="flex items-center gap-2">
                    {" "}
                    <Avatar className="size-5">
                      <AvatarImage src={token.img} className="size-5" />
                      <AvatarFallback></AvatarFallback>
                    </Avatar>
                    {token.name}
                    <span className="bg-muted-foreground/10 dark:bg-muted-foreground/30 text-muted-foreground rounded-md px-2 text-sm capitalize ">
                      {token.network}
                    </span>
                  </div>

                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedCoin === token.symbol
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
