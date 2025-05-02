"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreatePRModal } from "@/hooks/use-create-pr-modal";
import { CreatePullRequestForm } from "../forms/create-pull-request-form";

export function CreatePullRequestModal() {
  const { isOpen, responseId, attemptId, onClose } = useCreatePRModal();
  if (!responseId || !attemptId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Pull Request</DialogTitle>
          <DialogDescription className="flex">
            {/* <Terminal className="h-4 w-4" />
            This is still under active development. */}
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <CreatePullRequestForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
