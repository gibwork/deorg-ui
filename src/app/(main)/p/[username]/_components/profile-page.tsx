"use client";

import { getUserData, getUserDataByName } from "@/actions/get/get-user-data";
import NotFound from "@/app/not-found";
import { Icons } from "@/components/icons";
import ImageLoader from "@/components/image-loader";
import { LoaderButton } from "@/components/loader-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VouchDrawer } from "@/components/drawers/vouch-drawer";
import { useVouchDrawer } from "@/hooks/use-vouch-drawer";
import { banUserAsAdmin } from "@/features/admin/actions/ban-user";
import { unbanUserAsAdmin } from "@/features/admin/actions/unban-user";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Star,
  Check,
  Copy,
  Unlock,
  Trophy,
  Rocket,
  Wallet,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/common/user-avatar";
import UserName from "@/components/common/user-name";
import DateComponent from "@/components/date-component";
import Content from "@/components/tiptap/content";
import Link from "next/link";
import XAuthButton from "@/features/auth/components/x-auth-button";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { ReviewModal } from "./review-modal";

// Star Rating Component
export function StarRating({
  rating,
  className,
  size = 16,
}: {
  rating: number;
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("flex", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          )}
        />
      ))}
    </div>
  );
}

// Leave a Vouch Card Component
function LeaveVouchCard({ profileUser }: { profileUser: any }) {
  const { user } = useUser();
  const vouchDrawer = useVouchDrawer();
  const { onOpen } = useAuthModal();
  const isSelfVouch = user?.id === profileUser?.externalId;
  const isPrimaryWalletLinked = !!profileUser?.primaryWallet;

  if (isSelfVouch) {
    return null;
  }

  const hasVerifiedXAccount = !!user?.externalAccounts?.some(
    (account) =>
      account.provider === "x" && account.verification?.status === "verified"
  );

  const handleCardClick = () => {
    if (!hasVerifiedXAccount && user) {
      toast.error("Please verify your X account to vouch for this user.");
    } else {
      vouchDrawer.onOpen(profileUser);
    }
  };

  return (
    <Card
      className={cn(
        "mb-3 min-h-[110px] border-dashed border-2 border-violet-200 transition-colors bg-violet-50 dark:bg-accent dark:border-stone-500",
        "hover:bg-violet-100 dark:hover:bg-accent-500/50 hover:border-violet-300 cursor-pointer"
      )}
    >
      <CardContent className="p-2 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold">
              Has {profileUser.firstName || ""} earned your vouch?
            </span>
          </div>
        </div>

        <div className="text-xs min-h-[60px] group">
          <div className="relative">
            <p
              className={cn(
                " text-start",
                !hasVerifiedXAccount && user
                  ? "text-black dark:text-white"
                  : "text-black dark:text-white"
              )}
            >
              Give a vouch, make a tip, and show support.
              <div className="flex flex-wrap gap-2 justify-end">
                {user ? (
                  <XAuthButton
                    variant={null}
                    buttonText="Connect Your X Account"
                    className="text-black font-semibold text-xs opacity-50 group-hover:opacity-100 border-0 bg-violet-200 hover:bg-violet-300 h-8 mt-2 justify-center border-indigo-100 border-1 hover:text-black"
                  />
                ) : (
                  <Button
                    onClick={onOpen}
                    size="sm"
                    className="text-black font-semibold text-xs opacity-50 group-hover:opacity-100 border-0 bg-violet-200 hover:bg-violet-300 h-8 mt-2 justify-center border-indigo-100 border-1 hover:text-black"
                  >
                    Sign In or Create Account
                  </Button>
                )}

                {hasVerifiedXAccount && user && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!isPrimaryWalletLinked}
                      className={cn(
                        "text-black font-semibold text-xs border-0 bg-violet-200 hover:bg-violet-300 h-8 mt-2 justify-center border-indigo-100 border-1 hover:text-black",
                        isPrimaryWalletLinked
                          ? "group-hover:opacity-100"
                          : "opacity-50 cursor-not-allowed"
                      )}
                      onClick={!isSelfVouch ? handleCardClick : undefined}
                    >
                      <div className="flex items-center gap-1">Gib Vouch</div>
                    </Button>
                  </div>
                )}
              </div>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Review Card Component - Compact version
const ReviewCard = React.memo(({ review }: { review: any }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Extract text content from HTML for truncation
  const textContent = React.useMemo(() => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = review.content;
    return tempDiv.textContent || tempDiv.innerText || "";
  }, [review.content]);

  const isTextLong = textContent.length > 45;

  return (
    <>
      <Card className="mb-3 h-[110px] flex flex-col">
        <CardContent className="px-3 pt-3 pb-1 flex flex-col h-full ">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <Link href={`/p/${review.creator.username}`}>
                <UserAvatar user={review.creator} className="w-5 h-5" />
              </Link>
              <Link href={`/p/${review.creator.username}`}>
                <span className="text-xs font-medium hover:underline">
                  {review.creator.firstName}
                </span>
              </Link>
              <div className="flex items-center gap-0.5 bg-blue-50 dark:bg-blue-950/50 px-0.5 py-0.5 rounded-md">
                <Icons.x className="w-2 h-2" />
              </div>
              <StarRating rating={review.rating} size={10} />
            </div>
            <div className="flex items-center gap-0.5 bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded-md">
              <Icons.usdc className="w-3 h-3" />
              <span className="text-[10px] font-semibold">
                ${review.tipAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="relative">
            <div
              className={cn(
                "text-xs relative",
                !isTextLong ? "" : "max-h-10 overflow-hidden "
              )}
            >
              <Content content={review.content} className="text-xs" />{" "}
              {isTextLong && (
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-card to-transparent"></div>
              )}{" "}
            </div>

            {isTextLong && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] text-blue-500 hover:underline mt-1 inline-block"
              >
                Read more
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        review={review}
      />
    </>
  );
});

// Add display name for React DevTools
ReviewCard.displayName = "ReviewCard";

// Profile Page Skeleton Component
const ProfilePageSkeleton = () => {
  return (
    <section className="w-full lg:max-w-6xl xl:max-w-[1540px] lg:mx-auto sm:mx-6 p-5 mb-32">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <div className="flex gap-4">
          {/* Avatar Skeleton */}
          <div className="flex shrink-0 overflow-hidden rounded-full w-20 h-20 md:w-26 md:h-26">
            <Skeleton className="aspect-square h-full w-full rounded-full" />
          </div>

          {/* Name and Username Skeleton */}
          <div className="flex flex-col mt-3">
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>

        {/* Total Earned Section Skeleton */}
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <div className="flex items-center space-x-2 mt-1">
            <Skeleton className="rounded-full w-8 h-8" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* Vouch Section Skeleton */}
      <div className="mt-8">
        <div className="mb-4">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>

        {/* Vouches Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {/* Generate multiple skeleton cards */}
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="mb-3">
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
                <div className="text-xs">
                  <Skeleton className="h-2 w-full mb-1" />
                  <Skeleton className="h-2 w-full mb-1" />
                  <Skeleton className="h-2 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// No Vouches Placeholder Component with Skeleton Cards
const NoVouchesPlaceholder = ({
  username,
  isPrimaryWalletLinked,
}: {
  username: string;
  isPrimaryWalletLinked: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${username}`
      : `/p/${username}`;

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center col-span-full">
      {/* Skeleton Cards Stack */}
      <div className="relative h-48 w-full max-w-md mb-8">
        {/* Card 1 - Bottom */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-36 -rotate-6">
          <Card className="w-full h-full shadow-md">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center mt-4">
                <Skeleton className="h-6 w-6 rounded-full mr-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card 2 - Middle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-36 rotate-3">
          <Card className="w-full h-full shadow-md">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center mt-4">
                <Skeleton className="h-6 w-6 rounded-full mr-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card 3 - Top */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-36 -rotate-2">
          <Card className="w-full h-full shadow-md">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center mt-4">
                <Skeleton className="h-6 w-6 rounded-full mr-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message */}
      <h3 className="text-xl font-bold text-center mb-6">
        Ready to get your first vouch?
      </h3>

      {/* Action Button */}
      {isPrimaryWalletLinked ? (
        <div className="space-y-6 w-full max-w-md">
          <div className="bg-stone-50 dark:bg-muted rounded-lg p-4 flex items-center">
            <input
              type="text"
              value={profileUrl}
              className="flex-1 bg-transparent border-none text-sm text-muted-foreground focus:outline-none truncate mr-2"
              readOnly
            />
            <Button onClick={copyToClipboard} className="shrink-0 shadow-sm">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
          <Card className="bg-violet-50 dark:bg-violet-950/50 border-2 border-dashed border-violet-200 dark:border-violet-800">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    To start receiving vouches, please connect your primary
                    wallet in your account settings.
                  </p>
                </div>
                <Link
                  href={`/p/${username}/account`}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-2 bg-white dark:bg-card hover:bg-violet-50 dark:hover:bg-violet-900/50"
                  )}
                >
                  Go to Account Settings
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Benefits Section */}
      <div className="mt-4 pt-4 w-full max-w-3xl">
        <h4 className="text-center text-base font-medium mb-6">
          Why Vouches Matter
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Benefit 1: Unlock Features */}
          <div className="bg-muted/40 rounded-lg p-4 text-center">
            <div className="bg-primary/10 size-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Unlock className="h-5 w-5 text-primary" />
            </div>
            <h5 className="font-medium mb-1">Unlock Features</h5>
            <p className="text-xs text-muted-foreground">
              Gain access to premium features and capabilities as you collect
              vouches.
            </p>
          </div>

          {/* Benefit 2: Win Bounties */}
          <div className="bg-muted/40 rounded-lg p-4 text-center">
            <div className="bg-primary/10 size-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <h5 className="font-medium mb-1">Win Bounties</h5>
            <p className="text-xs text-muted-foreground">
              Increase your chances of winning bounties with a strong vouch
              profile.
            </p>
          </div>

          {/* Benefit 3: More Opportunities */}
          <div className="bg-muted/40 rounded-lg p-4 text-center">
            <div className="bg-primary/10 size-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <h5 className="font-medium mb-1">More Opportunities</h5>
            <p className="text-xs text-muted-foreground">
              Attract more clients and projects as your reputation grows through
              vouches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { user, isLoaded } = useUser();
  const { username: profileUsername } = useParams<{ username: string }>();
  const transaction = useTransactionStatus();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const { data, error, isLoading } = useQuery({
    queryKey: [`user-${profileUsername}`],
    queryFn: async () => {
      const userData =
        user?.username === profileUsername
          ? await getUserData()
          : await getUserDataByName(profileUsername);
      if (userData.error) throw new Error(userData.error);
      if (userData.success) return userData.success;
    },
  });

  let usdcAmountUserHasEarned = "$0.00";
  if (data?.totalAmountEarned && !isNaN(data?.totalAmountEarned)) {
    usdcAmountUserHasEarned = "$" + data?.totalAmountEarned.toFixed(2);
  }

  const handleBanUser = async () => {
    transaction.onStart();
    toast.loading("Banning user...");
    try {
      const { success, error } = await banUserAsAdmin(
        data.externalId,
        data.username
      );
      if (error) {
        throw new Error("Something went wrong!");
      }
      await queryClient.invalidateQueries({
        queryKey: [`user-${profileUsername}`],
      });
      toast.success("User Banned!");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      transaction.onEnd();
      toast.dismiss();
    }
  };

  const handleUnBanUser = async () => {
    transaction.onStart();
    toast.loading("UnBanning user...");
    try {
      const { success, error } = await unbanUserAsAdmin(
        data.externalId,
        data.username
      );
      if (error) {
        throw new Error("Something went wrong!");
      }
      await queryClient.invalidateQueries({
        queryKey: [`user-${profileUsername}`],
      });
      toast.success("User UnBanned!");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      transaction.onEnd();
      toast.dismiss();
    }
  };

  if (isLoading || !isLoaded) return <ProfilePageSkeleton />;

  const isAdmin = user?.publicMetadata?.role === "admin";

  if (error) return <NotFound />;
  return (
    <section className="w-full lg:max-w-6xl xl:max-w-[1540px] lg:mx-auto sm:mx-6 p-5 mb-32">
      <div className="flex flex-col md:flex-row md:justify-between  gap-4">
        <div className="flex gap-4">
          <div className=" flex shrink-0 overflow-hidden rounded-full w-20 h-20 md:w-26 md:h-26 ">
            <Avatar className="aspect-square h-full w-full">
              <ImageLoader
                src={data.profilePicture}
                alt={data.username}
                height={100}
                width={100}
                quality={100}
              />
              <AvatarFallback></AvatarFallback>
            </Avatar>
          </div>

          <p className="flex flex-col font-semibold text-xl md:text-2xl mt-2">
            <span className="flex items-center gap-2 capitalize">
              {data?.firstName}{" "}
              {data.isPhoneVerified || data.xAccountVerified ? (
                <button title="verified">
                  <BadgeCheck className="text-background size-6 fill-theme  -ml-1" />
                </button>
              ) : null}
              {isAdmin && (
                <div className="pl-4">
                  {data?.isBanned ? (
                    <LoaderButton
                      isLoading={transaction.isProcessing}
                      variant="destructive"
                      size="sm"
                      onClick={handleUnBanUser}
                    >
                      {" "}
                      UnBan User
                    </LoaderButton>
                  ) : (
                    <LoaderButton
                      isLoading={transaction.isProcessing}
                      variant="destructive"
                      size="sm"
                      onClick={handleBanUser}
                    >
                      {" "}
                      Ban User
                    </LoaderButton>
                  )}
                </div>
              )}
            </span>
            <span className="text-muted-foreground text-base md:text-lg">
              @{data?.username}
            </span>
          </p>
        </div>
        <div className="">
          <h4 className="font-semibold text-lg flex items-center">
            Total Earned
          </h4>
          <div className="flex items-center space-x-2 mt-1">
            <Icons.usdc className=" rounded-full w-8 h-8" />
            <p className="text-2xl font-semibold">{usdcAmountUserHasEarned}</p>
          </div>
          {/* <p className="mt-2 text-sm opacity-80 whitespace-nowrap">
            {data?.percentRank === null ? (
              "No Work, No ranking"
            ) : data?.percentRank === 100 ? (
              <>
                Top <span className="font-bold opacity-100">Worker!</span> Rank{" "}
                <span className="font-bold opacity-100">#1</span>
              </>
            ) : (
              <>
                Above{" "}
                <span className="font-bold opacity-100">
                  {userIsInEarningPercentage}
                </span>{" "}
                of people
              </>
            )}
          </p> */}
        </div>
      </div>

      {/* <div className="py-2">
        <XAuthButton variant={"ghost"} />
      </div> */}

      {/* <div className="flex mt-6">
        <span className="font-semibold rounded-md p-2">PROOF OF WORK</span>
        <span className="font-semibold p-2 mx-2 opacity-50 ">ACTIVITY</span>
        <span className="font-semibold p-2 mx-2 opacity-50 ">REVIEWS</span>
      </div>
      <div className="flex mt-2 p-4 bg-stone-50 dark:bg-muted w-full h-[20rem] text-stone-400">
        soon
      </div> */}

      {/* Reviews Section */}
      <div className="mt-8">
        {/* Only show the section header if the user has vouches or is not viewing their own profile */}
        {(data.vouches && data.vouches.length > 0) ||
        user?.username !== profileUsername ? (
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-extrabold flex items-center gap-2">
                Vouch
              </h2>
              <p className="text-sm text-muted-foreground">
                A space dedicated to building trust through peer validation.
                Here, users vouch for completed work, reinforcing standards and
                strengthening the network.
              </p>
            </div>
          </div>
        ) : null}

        {/* Vouches container with relative positioning */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-2">
            {user?.id !== data?.externalId && (
              <div className="grid-item h-min self-start">
                <LeaveVouchCard profileUser={data} />
              </div>
            )}

            {/* Calculate the number of vouches to show initially (2 rows) */}
            {(() => {
              // Calculate how many vouches to show in 2 rows
              const getVisibleCount = () => {
                // Use a fixed value for server-side rendering
                // For small screens: 3 columns, for large screens: 4 columns
                // We'll use 6 (2 rows of 3 columns) as a safe default
                return 6; // 2 rows of 3 columns (works for all screen sizes)
              };

              // If no vouches
              if (!data.vouches || data.vouches.length === 0) {
                // If viewing own profile, show the placeholder
                if (user?.username === profileUsername) {
                  return (
                    <NoVouchesPlaceholder
                      username={data.username}
                      isPrimaryWalletLinked={!!data.primaryWallet}
                    />
                  );
                }
                return null;
              }

              // Get the vouches to display
              const visibleVouches = isExpanded
                ? data.vouches
                : data.vouches.slice(0, getVisibleCount());

              return (
                <>
                  {/* Render visible vouches */}
                  {visibleVouches.map((review: any) => (
                    <div key={review.id} className="">
                      <ReviewCard review={review} />
                    </div>
                  ))}
                </>
              );
            })()}

            <VouchDrawer />
          </div>

          {/* Fade overlay - only when not expanded and there are more vouches */}
          {!isExpanded && data.vouches && data.vouches.length > 6 && (
            <div className="absolute bottom-12 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-background to-transparent pointer-events-none" />
          )}

          {/* View More button - positioned at the bottom of the fade */}
          {data.vouches && data.vouches.length > 6 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-8 relative z-10"
              >
                {isExpanded
                  ? "View Less"
                  : `View ${data.vouches.length - 6} More Vouches`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
