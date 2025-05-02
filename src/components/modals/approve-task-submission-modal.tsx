"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useApproveTaskSubmissionModal } from "@/hooks/use-approve-task-submission-modal";
import { ApproveTaskForm } from "../forms/approve-task-form";
import { X } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { useTransactionStatus } from "@/hooks/use-transaction-status";

export function ApproveTaskSubmissionModal() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isOpen, onClose, onOpen, taskId, taskSubmissionId } =
    useApproveTaskSubmissionModal();
  const transaction = useTransactionStatus();

  if (!taskId || !taskSubmissionId) return null;

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={(open) =>
          open ? onOpen(taskId, taskSubmissionId) : onClose()
        }
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-2xl">Pay User</DrawerTitle>
            <DrawerClose
              disabled={transaction.isProcessing}
              className="absolute right-4 top-4 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary"
            >
              <X className="h-5 w-5" />
            </DrawerClose>
          </DrawerHeader>

          <div className="px-2 pb-4">
            <ApproveTaskForm />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) =>
        open ? onOpen(taskId, taskSubmissionId) : onClose()
      }
    >
      <SheetContent
        className="!p-0"
        onInteractOutside={(e) => {
          if (transaction.isProcessing) {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader className="border-b p-6 py-4">
          <SheetTitle className="text-2xl"> Pay User</SheetTitle>
          <SheetClose
            disabled={transaction.isProcessing}
            className="absolute right-4 top-3 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary"
          >
            <X className="h-5 w-5" />
          </SheetClose>
        </SheetHeader>

        <div className="p-2">
          <ApproveTaskForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
