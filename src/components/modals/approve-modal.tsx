"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLoadingModal } from "@/hooks/use-loading-modal";
import { useApproveModal } from "@/hooks/use-approve-modal";
import { approveAnswer } from "@/actions/post/approve-answer";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ApproveAnswerForm } from "../forms/approve-answer-form";

export function ApproveModal() {
  const { isOpen, questionId, answerId } = useApproveModal();

  if (!questionId || !answerId) return null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Pay User</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. <br /> The user will be allowed to
            claim the amount.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ApproveAnswerForm />
      </AlertDialogContent>
    </AlertDialog>
  );
}
