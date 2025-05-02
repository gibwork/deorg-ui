"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "usehooks-ts";
import { Icons } from "@/components/icons";
import { StarRating } from "./profile-page";
import Link from "next/link";
import UserAvatar from "@/components/common/user-avatar";
import Content from "@/components/tiptap/content";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: any;
}

export function ReviewModal({ isOpen, onClose, review }: ReviewModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href={`/p/${review.creator.username}`}>
                  <UserAvatar user={review.creator} className="w-8 h-8" />
                </Link>
                <div>
                  <DialogTitle className="text-lg">
                    {review.creator.firstName}&apos;s Review
                  </DialogTitle>

                  <div className="flex items-center gap-1">
                    <StarRating rating={review.rating} size={14} />
                    <div className="flex items-center gap-0.5 bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded-md">
                      <Icons.usdc className="w-3 h-3" />
                      <span className="text-[10px] font-semibold">
                        ${review.tipAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="">
            <Content content={review.content} className="text-sm" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        !open ? onClose() : null;
      }}
    >
      <DrawerContent className="pb-3">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href={`/p/${review.creator.username}`}>
                <UserAvatar user={review.creator} className="w-8 h-8" />
              </Link>
              <div>
                <DrawerTitle className="text-lg">
                  {review.creator.firstName}&apos;s Review
                </DrawerTitle>
                <div className="flex items-center gap-1">
                  <StarRating rating={review.rating} size={14} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded-md">
              <Icons.usdc className="w-3 h-3" />
              <span className="text-[10px] font-semibold">
                ${review.tipAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </DrawerHeader>
        <div className="px-4">
          <Content content={review.content} className="text-sm" />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
