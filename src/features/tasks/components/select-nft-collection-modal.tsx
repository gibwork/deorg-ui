"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounceValue } from "usehooks-ts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  searchNFTCollections,
  type SearchNFTCollectionsResponse,
} from "@/features/tasks/actions/get-nft-collections";
import { BadgeCheck, FileSearch, SearchX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  isVerified: boolean;
}

function SelectNFTCollection({
  isOpen,
  onSelectCollection,
}: {
  isOpen: boolean;
  onSelectCollection: (collection: NFTCollection) => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <SelectNFTCollectionComponent onSelectCollection={onSelectCollection} />
  );
}

export default SelectNFTCollection;

export function SelectNFTCollectionComponent({
  onSelectCollection,
}: {
  onSelectCollection: (collection: NFTCollection) => void;
}) {
  const [searchParam, setSearchParam] = useDebounceValue("", 400);

  const {
    data: searchResults,
    error: searchError,
    isLoading: searchLoading,
  } = useQuery({
    queryKey: ["searchNFTCollections", searchParam],
    refetchInterval: false,
    queryFn: async ({ queryKey }) => {
      const searchKey = queryKey[1];
      const collections = await searchNFTCollections(searchKey!);

      if (collections.error) throw new Error(collections.error);

      return (
        (collections.success.results as SearchNFTCollectionsResponse[]) || []
      );
    },
  });

  return (
    <Command
      shouldFilter={false}
      className="rounded-lg border shadow-sm md:min-w-[450px]"
    >
      <CommandInput
        placeholder="Search NFT collection by name"
        className="h-9 w-full"
        onValueChange={setSearchParam}
      />
      <CommandList className=" ">
        {searchLoading ? (
          <>
            <LoadingSkeleton />
          </>
        ) : searchError || !searchResults?.length ? (
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <SearchX className="size-10" />
              <h2 className="text-lg font-semibold mb-2">
                {" "}
                NFT Collection Not Found{" "}
              </h2>
              <p className="text-muted-foreground max-w-md">
                {searchParam
                  ? `We couldn't find any Collection matching "${searchParam}".`
                  : `There are currently no NFT Collection available.`}
              </p>
              <p className="text-muted-foreground mb-4 max-w-md">
                If you believe this is an error or want to request support for
                your NFT collection, please reach out to us on{" "}
                <Link
                  href="https://discord.gg/KnKvp8hsrb"
                  prefetch={false}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-blue-500"
                >
                  Discord
                </Link>
                .
              </p>
            </div>
          </CommandEmpty>
        ) : null}

        <CommandGroup heading="">
          <div className="grid md:grid-cols-4 md:items-stretch gap-2">
            {searchResults?.map((nft) => (
              <CommandItem
                key={nft.id}
                onSelect={() => onSelectCollection(nft)}
                className="cursor-pointer  "
              >
                <div className="hidden md:block ">
                  <div className="w-full">
                    <Image
                      width={100}
                      height={100}
                      src={nft.imageUrl}
                      alt={nft.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <p className=" flex gap-0.5 items-center  p-1 ">
                    <span className=" text-sm font-semibold truncate max-w-[160px]  ">
                      {nft?.name ?? "Unknown Token"}
                    </span>
                  </p>
                </div>
                <div className="flex md:hidden gap-2">
                  <Avatar className="w-7 h-7 ">
                    <AvatarImage src={nft.imageUrl} alt={nft.name} />
                    <AvatarFallback className="bg-muted" />
                  </Avatar>
                  <p className="flex flex-col">
                    <span className="flex items-center gap-2">
                      {nft?.symbol ?? "Unknown Token"}
                    </span>
                    <span className="flex gap-0.5 items-center text-xs text-muted-foreground">
                      {nft?.name ?? "Metadata not found"}
                      {nft.isVerified && (
                        <BadgeCheck className="text-primary-foreground size-3.5 fill-theme" />
                      )}
                    </span>
                  </p>
                </div>
              </CommandItem>
            ))}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

const LoadingSkeleton = () => {
  return (
    <>
      <div className="md:hidden flex flex-col gap-2 my-1">
        <div className="flex items-start justify-between w-full ">
          <Skeleton className="w-full  h-10" />
        </div>
        <div className="flex items-start justify-between w-full ">
          <Skeleton className="w-full  h-10" />
        </div>
        <div className="flex items-start justify-between w-full ">
          <Skeleton className="w-full  h-10" />
        </div>
        <div className="flex items-start justify-between w-full ">
          <Skeleton className="w-full  h-10" />
        </div>
      </div>
      <div className="hidden md:grid md:grid-cols-4 gap-2">
        <div className="p-2 w-full ">
          <Skeleton className="w-full  h-36" />
          <Skeleton className="w-full mt-1  h-5" />{" "}
          <Skeleton className="w-2/3 mt-1  h-5" />
        </div>
        <div className="p-2 w-full ">
          <Skeleton className="w-full  h-36" />
          <Skeleton className="w-full mt-1  h-5" />{" "}
          <Skeleton className="w-2/3 mt-1  h-5" />
        </div>
        <div className="p-2 w-full ">
          <Skeleton className="w-full  h-36" />
          <Skeleton className="w-full mt-1  h-5" />{" "}
          <Skeleton className="w-2/3 mt-1  h-5" />
        </div>
        <div className="p-2 w-full ">
          <Skeleton className="w-full  h-36" />
          <Skeleton className="w-full mt-1  h-5" />{" "}
          <Skeleton className="w-2/3 mt-1  h-5" />
        </div>
      </div>
    </>
  );
};
