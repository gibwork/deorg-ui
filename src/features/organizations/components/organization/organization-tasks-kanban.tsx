"use client";

import { useState } from "react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { useTransactionStore } from "@/features/transaction-toast/use-transaction-store";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  compeleteTaskTransaction,
  completeTask,
} from "../../actions/tasks/comlete-task";
import {
  enableTaskWithdrawTransaction,
  enableTaskWithdraw,
} from "../../actions/tasks/enable-task-withdraw";

interface KanbanBoardProps {
  columns: {
    ready: any[];
    completed: any[];
    paid: any[];
  };
  orgId: string;
  projectId: string;
}

export function OrganizationTasksKanban({
  columns: initialColumns,
  orgId,
  projectId,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const { publicKey, signTransaction } = useWallet();
  const queryClient = useQueryClient();
  const transactionStatus = useTransactionStatus();
  const { startTransaction, updateStep, updateStatus, addWarning } =
    useTransactionStore.getState();

  const handleCompleteTask = async (task: any) => {
    if (!signTransaction) return false;
    transactionStatus.onStart();

    try {
      toast.dismiss();
      const transactionId = startTransaction(`Mark Complete`);

      updateStep(1, "loading", "Preparing transaction details...");
      const { success, error } = await compeleteTaskTransaction(
        task.accountAddress
      );
      if (error) {
        throw new Error(error);
      }

      updateStep(1, "success");
      updateStep(2, "loading", "Please sign the transaction in your wallet");

      const retreivedTx = Transaction.from(
        Buffer.from(success.serializedTransaction, "base64")
      );

      const serializedTx = await signTransaction(retreivedTx);
      const serializedSignedTx = serializedTx?.serialize().toString("base64");

      updateStep(2, "success");
      updateStep(3, "loading", "Submitting transaction to the network...");

      const completeTaskResponse = await completeTask({
        transactionId: success.transactionId,
        serializedTransaction: serializedSignedTx,
      });

      updateStep(3, "success");
      updateStep(4, "loading", "Confirming transaction...");

      if (completeTaskResponse.error) {
        throw new Error(completeTaskResponse.error);
      }

      queryClient.invalidateQueries({
        queryKey: ["project_tasks", projectId],
      });

      updateStep(4, "success");
      updateStatus("success");
      return true;
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again later";

      const currentStep =
        [1, 2, 3, 4].find((step) => {
          const activeTransaction =
            useTransactionStore.getState().activeTransaction;
          return (
            activeTransaction?.steps.find((s) => s.id === step)?.status ===
            "loading"
          );
        }) || 2;

      updateStep(currentStep, "error", errorMessage);
      updateStatus("error");

      if (error instanceof Error && error.message.includes("insufficient")) {
        addWarning("Insufficient balance for transaction");
      }
      return false;
    } finally {
      transactionStatus.onEnd();
    }
  };

  const handleEnableTaskWithdraw = async (task: any) => {
    if (!signTransaction) return false;
    transactionStatus.onStart();

    try {
      toast.dismiss();
      const transactionId = startTransaction(`Enable Task Withdraw`);

      updateStep(1, "loading", "Preparing transaction details...");
      const { success, error } = await enableTaskWithdrawTransaction(
        task.accountAddress
      );
      if (error) {
        throw new Error(error);
      }

      updateStep(1, "success");
      updateStep(2, "loading", "Please sign the transaction in your wallet");

      const retreivedTx = Transaction.from(
        Buffer.from(success.serializedTransaction, "base64")
      );

      const serializedTx = await signTransaction(retreivedTx);
      const serializedSignedTx = serializedTx?.serialize().toString("base64");

      updateStep(2, "success");
      updateStep(3, "loading", "Submitting transaction to the network...");

      const enableTaskWithdrawResponse = await enableTaskWithdraw({
        transactionId: success.transactionId,
        serializedTransaction: serializedSignedTx,
      });

      updateStep(3, "success");
      updateStep(4, "loading", "Confirming transaction...");

      if (enableTaskWithdrawResponse.error) {
        throw new Error(enableTaskWithdrawResponse.error);
      }

      queryClient.invalidateQueries({
        queryKey: ["project_tasks", projectId],
      });

      updateStep(4, "success");
      updateStatus("success");
      return true;
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again later";

      const currentStep =
        [1, 2, 3, 4].find((step) => {
          const activeTransaction =
            useTransactionStore.getState().activeTransaction;
          return (
            activeTransaction?.steps.find((s) => s.id === step)?.status ===
            "loading"
          );
        }) || 2;

      updateStep(currentStep, "error", errorMessage);
      updateStatus("error");

      if (error instanceof Error && error.message.includes("insufficient")) {
        addWarning("Insufficient balance for transaction");
      }
      return false;
    } finally {
      transactionStatus.onEnd();
    }
  };

  const onDragStart = (result: any) => {
    setIsDragging(true);

    const sourceColumn =
      columns[result.source.droppableId as keyof typeof columns];
    const task = sourceColumn.find(
      (t) => t.accountAddress === result.draggableId
    );
    setDraggedTask(task);
  };

  const onDragEnd = async (result: any) => {
    setIsDragging(false);
    setDraggedTask(null);
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped back in the same place
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Find the task that was dragged
    const sourceColumn = columns[source.droppableId as keyof typeof columns];
    const taskIndex = sourceColumn.findIndex(
      (task) => task.accountAddress === draggableId
    );

    if (taskIndex === -1) return;

    const task = { ...sourceColumn[taskIndex] };

    // Check if user is authorized to move the task
    if (
      source.droppableId === "ready" &&
      destination.droppableId === "completed"
    ) {
      // Only task assignee can move from ready to completed
      if (publicKey?.toString() !== task.assignee?.walletAddress) {
        toast.error("Only the task assignee can mark a task as completed");
        return;
      }
    } else if (
      source.droppableId === "completed" &&
      destination.droppableId === "paid"
    ) {
      // Only non-assignee members can move from completed to paid
      if (publicKey?.toString() === task.assignee?.walletAddress) {
        toast.error("Task assignee cannot enable task withdraw");
        return;
      }
    }

    // Prevent moving tasks back from paid state
    if (source.droppableId === "paid") {
      toast.error("Tasks cannot be moved back from paid state");
      return;
    }

    // Prevent moving tasks back from completed state
    if (
      source.droppableId === "completed" &&
      destination.droppableId === "ready"
    ) {
      toast.error("Completed tasks cannot be moved back to ready state");
      return;
    }

    // Prevent direct movement from ready to paid
    if (source.droppableId === "ready" && destination.droppableId === "paid") {
      toast.error("Tasks must be completed before being marked as paid");
      return;
    }

    const originalColumns = { ...columns };

    // Update the task status based on the destination column
    task.status = destination.droppableId;

    // Create new arrays for the affected columns
    const newSourceColumn = [...sourceColumn];
    newSourceColumn.splice(taskIndex, 1);

    const destinationColumn =
      columns[destination.droppableId as keyof typeof columns];
    const newDestinationColumn = [...destinationColumn];
    newDestinationColumn.splice(destination.index, 0, task);

    // Optimistically update the UI
    setColumns({
      ...columns,
      [source.droppableId]: newSourceColumn,
      [destination.droppableId]: newDestinationColumn,
    });

    let success = false;

    // Handle the transaction based on the destination
    if (destination.droppableId === "completed") {
      success = await handleCompleteTask(task);
      if (!success) {
        toast.error("Failed to complete task. Please try again.");
      }
    } else if (destination.droppableId === "paid") {
      success = await handleEnableTaskWithdraw(task);
      if (!success) {
        toast.error("Failed to enable task withdraw. Please try again.");
      }
    }

    // If the transaction failed, revert the UI changes
    if (!success) {
      setColumns(originalColumns);
    }
  };

  const columnTitles = {
    ready: "Ready",
    completed: "Completed",
    paid: "Paid",
  };

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(columns).map(([columnId, tasks]) => (
          <div key={columnId} className="flex flex-col h-full">
            <div className="bg-muted rounded-t-lg p-3 font-medium">
              {columnTitles[columnId as keyof typeof columnTitles]} (
              {tasks.length})
            </div>
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 bg-muted/30 rounded-b-lg p-2 min-h-[300px] transition-colors ${
                    snapshot.isDraggingOver ? "bg-muted/50" : ""
                  }`}
                >
                  {tasks.map((task, index) => (
                    <Draggable
                      key={task.accountAddress}
                      draggableId={task.accountAddress}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-2 transition-shadow ${
                            snapshot.isDragging ? "shadow-lg" : ""
                          }`}
                        >
                          <KanbanCard
                            task={task}
                            orgId={orgId}
                            projectId={projectId}
                            isDragging={!!snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

interface KanbanCardProps {
  task: any;
  orgId: string;
  projectId: string;
  isDragging: boolean;
}

function KanbanCard({ task, orgId, projectId, isDragging }: KanbanCardProps) {
  return (
    <Card
      className={`p-3 bg-background transition-all ${
        isDragging ? "shadow-lg" : "hover:shadow-md"
      }`}
    >
      <div className="mb-2 flex justify-between items-start">
        <h4 className="font-medium text-sm">{task.title}</h4>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {task.paymentAmount} SOL
      </p>
      <div className="flex justify-between items-center">
        <Avatar className="h-6 w-6">
          <AvatarImage
            src={task.assignee.profilePicture}
            alt={task.assignee.username}
          />
          <AvatarFallback>{task.assignee.username.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </Card>
  );
}

function TaskPriorityBadge({ priority }: { priority: string }) {
  let className = "px-1.5 py-0.5 text-[10px] rounded-full ";

  switch (priority) {
    case "high":
      className +=
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      break;
    case "medium":
      className +=
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      break;
    case "low":
      className +=
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    default:
      className +=
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }

  return <Badge className={className}>{priority}</Badge>;
}

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
