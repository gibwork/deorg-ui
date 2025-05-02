"use client";

import { useState } from "react";
import { OrganizationTask } from "@/types/types.organization";

export interface UseTaskModalProps {
  onStatusChange?: (taskId: string, newStatus: OrganizationTask["status"]) => void;
  onCommentAdd?: (taskId: string, comment: string) => void;
  onVoteTask?: (taskId: string) => void;
}

export function useTaskModal({ onStatusChange, onCommentAdd, onVoteTask }: UseTaskModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<OrganizationTask | null>(null);

  const openTaskModal = (task: OrganizationTask) => {
    setActiveTask(task);
    setIsOpen(true);
  };

  const closeTaskModal = () => {
    setIsOpen(false);
  };

  const handleStatusChange = (taskId: string, newStatus: OrganizationTask["status"]) => {
    if (onStatusChange) {
      onStatusChange(taskId, newStatus);
    }
  };

  const handleCommentAdd = (taskId: string, comment: string) => {
    if (onCommentAdd) {
      onCommentAdd(taskId, comment);
    }
  };
  
  const handleVoteTask = (taskId: string) => {
    if (onVoteTask) {
      onVoteTask(taskId);
    }
  };

  return {
    isOpen,
    activeTask,
    openTaskModal,
    closeTaskModal,
    handleStatusChange,
    handleCommentAdd,
    handleVoteTask
  };
}
