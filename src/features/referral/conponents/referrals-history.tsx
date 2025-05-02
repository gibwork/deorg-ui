"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { getReferrals } from "../api/get-referrals";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DateComponent from "@/components/date-component";
import { formatTokenAmount, getFormattedAmount } from "@/utils/format-amount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ImageLoader from "@/components/image-loader";

export function ReferralsHistory() {
  const loadMoreRef = useRef(null);
  const skeletonCount = 5;
  const { userId } = useAuth();

  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isError,
  } = useInfiniteQuery({
    queryKey: ["referrals_history"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const services = await getReferrals(Number(pageParam));
      if (services.error) throw new Error(services.error);
      return services!.success!.results;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.length === 0) return undefined;
      return allPages?.length + 1;
    },
    enabled: !!userId,
  });

  const handleObserver = useCallback(
    (entries: any) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    };
    const curr = loadMoreRef.current;
    const observer = new IntersectionObserver(handleObserver, option);
    if (curr) observer.observe(curr);
    return () => {
      if (curr) observer.unobserve(curr);
    };
  }, [handleObserver]);

  const allItems = data?.pages?.flatMap((page) => page) || [];

  // Error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No referrals found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Initial loading state or no data
  if (!data && isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(skeletonCount)
                .fill(0)
                .map((_, index) => (
                  <LoadingSkeleton key={index} />
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (allItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No referrals found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-2">
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-sm md:text-base ">
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allItems.map((referralItem) => (
                <TableRow
                  key={referralItem.id}
                  className="text-sm md:text-base font-semibold"
                >
                  <TableCell className="w-[120px] md:w-fit ">
                    <DateComponent
                      datetime={referralItem.createdAt}
                      type="datetime"
                    />
                  </TableCell>
                  <TableCell>
                    {referralItem?.task ? "Created Work" : "Accepted Work"}
                  </TableCell>
                  <TableCell className="flex flex-col items-end ">
                    <div className="flex items-center gap-1 ">
                      <span>
                        {getFormattedAmount(
                          formatTokenAmount(
                            referralItem?.asset?.amount,
                            referralItem?.asset?.decimals
                          ),
                          6,
                          true
                        )}
                      </span>
                      <div className="flex  w-fit">
                        <Avatar className="w-6 h-6 ">
                          <ImageLoader
                            src={referralItem?.asset?.imageUrl}
                            alt={referralItem?.asset?.symbol}
                            height={25}
                            width={25}
                            quality={50}
                          />
                          <AvatarFallback>T</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {isFetchingNextPage &&
                Array(2)
                  .fill(0)
                  .map((_, index) => (
                    <LoadingSkeleton key={`loading-${index}`} />
                  ))}
            </TableBody>
          </Table>

          {hasNextPage && !isFetchingNextPage && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}

          <div ref={loadMoreRef} className="h-4" />
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton component
const LoadingSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell className="text-right">
      <div className="flex flex-col items-end gap-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </TableCell>
  </TableRow>
);

export default ReferralsHistory;
