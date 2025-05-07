"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { CreateTaskForm } from "./create-task-form";
import { Member } from "@/types/types.organization";

interface CreateTaskButtonProps {
  members: Array<Member>;
  projectId: string;
}

export function CreateTaskButton({
  members,
  projectId,
}: CreateTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <CreateTaskForm
          members={members.map((member, index) => ({
            id: `member-${index}`, // Generate a temporary ID
            username: member.user.username,
            walletAddress: member.user.walletAddress,
            profilePicture: member.user.profilePicture,
          }))}
          projectId={projectId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
