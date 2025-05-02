"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useEditModal } from "@/hooks/use-edit-modal";
import { useQueryClient } from "@tanstack/react-query";
import { Question } from "@/types/types.work";

export function AnswerEditModal() {
  const queryClient = useQueryClient();
  const { isOpen, questionId, answerId, onClose } = useEditModal();
  if (!questionId || !answerId) return null;

  const question = queryClient.getQueryData([
    `questions-${questionId}`,
  ]) as Question;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Answer</DialogTitle>
          <DialogDescription>
            This is still under active development. Please check back later.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          {/* <TiptapEditor
            content={
              question.answers!.find((item) => item.id === answerId)?.content ||
              ""
            }
          /> */}
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
