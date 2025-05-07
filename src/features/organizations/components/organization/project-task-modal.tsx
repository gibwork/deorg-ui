"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Task } from "../../actions/tasks/list-tasks";
import { Project } from "../../actions/projects/get-organization-projects";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  compeleteTaskTransaction,
  completeTask,
} from "../../actions/tasks/comlete-task";
import { toast } from "sonner";
import { Transaction } from "@solana/web3.js";
import { createProject } from "../../actions/projects/create-project";
import {
  enableTaskWithdraw,
  enableTaskWithdrawTransaction,
} from "../../actions/tasks/enable-task-withdraw";
import { withdrawTaskFunds } from "../../actions/tasks/withdraw-task-funds";
import { withdrawTaskFundsTransaction } from "../../actions/tasks/withdraw-task-funds";
import { LoaderButton } from "@/components/loader-button";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { useTransactionStore } from "@/features/transaction-toast/use-transaction-store";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

function ProjectTaskModal({
  project,
  task,
  showTaskDetailsModal,
  setShowTaskDetailsModal,
}: {
  project: Project;
  task: Task;
  showTaskDetailsModal: boolean;
  setShowTaskDetailsModal: (show: boolean) => void;
}) {
  const params = useParams();
  const queryClient = useQueryClient();
  const { publicKey, signTransaction } = useWallet();
  const {
    startTransaction,
    updateStep,
    setTxHash,
    updateStatus,
    addWarning,
    resetTransaction,
  } = useTransactionStore.getState();
  const transactionStatus = useTransactionStatus();

  const handleCompleteTask = async () => {
    if (!signTransaction) return;
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
        queryKey: ["project_tasks", project.uuid],
      });

      updateStep(4, "success");

      updateStatus("success");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again later";

      // Find the current step that failed
      const currentStep =
        [1, 2, 3, 4].find((step) => {
          const activeTransaction =
            useTransactionStore.getState().activeTransaction;
          return (
            activeTransaction?.steps.find((s) => s.id === step)?.status ===
            "loading"
          );
        }) || 2;

      // Update the failed step with error message
      updateStep(currentStep, "error", errorMessage);
      updateStatus("error");

      // Add warning if it's a specific type of error
      if (error instanceof Error && error.message.includes("insufficient")) {
        addWarning("Insufficient balance for transaction");
      }
    } finally {
      transactionStatus.onEnd();
      setShowTaskDetailsModal(false);
    }
  };

  const handleEnableTaskWithdraw = async () => {
    if (!signTransaction) return;
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

      updateStep(2, "success");
      updateStep(3, "loading", "Submitting transaction to the network...");

      const serializedSignedTx = serializedTx?.serialize().toString("base64");

      const enableTaskWithdrawResponse = await enableTaskWithdraw({
        transactionId: success.transactionId,
        serializedTransaction: serializedSignedTx,
      });

      if (enableTaskWithdrawResponse.error) {
        throw new Error(enableTaskWithdrawResponse.error);
      }

      queryClient.invalidateQueries({
        queryKey: ["project_tasks", project.uuid],
      });

      updateStep(4, "success");

      updateStatus("success");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again later";

      // Find the current step that failed
      const currentStep =
        [1, 2, 3, 4].find((step) => {
          const activeTransaction =
            useTransactionStore.getState().activeTransaction;
          return (
            activeTransaction?.steps.find((s) => s.id === step)?.status ===
            "loading"
          );
        }) || 2;

      // Update the failed step with error message
      updateStep(currentStep, "error", errorMessage);
      updateStatus("error");

      // Add warning if it's a specific type of error
      if (error instanceof Error && error.message.includes("insufficient")) {
        addWarning("Insufficient balance for transaction");
      }
    } finally {
      setShowTaskDetailsModal(false);
      transactionStatus.onEnd();
    }
  };

  const handleWithdrawTaskFunds = async () => {
    if (!signTransaction) return;
    transactionStatus.onStart();

    try {
      toast.dismiss();
      const transactionId = startTransaction(`Withdraw Task Funds`);

      updateStep(1, "loading", "Preparing transaction details...");

      const { success, error } = await withdrawTaskFundsTransaction(
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

      updateStep(2, "success");
      updateStep(3, "loading", "Submitting transaction to the network...");

      const serializedSignedTx = serializedTx?.serialize().toString("base64");

      const withdrawTaskFundsResponse = await withdrawTaskFunds({
        transactionId: success.transactionId,
        serializedTransaction: serializedSignedTx,
      });

      updateStep(3, "success");
      updateStep(4, "loading", "Confirming transaction...");
      if (withdrawTaskFundsResponse.error) {
        throw new Error(withdrawTaskFundsResponse.error);
      }

      queryClient.invalidateQueries({
        queryKey: ["project_tasks", project.uuid],
      });

      updateStep(4, "success");

      updateStatus("success");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again later";

      // Find the current step that failed
      const currentStep =
        [1, 2, 3, 4].find((step) => {
          const activeTransaction =
            useTransactionStore.getState().activeTransaction;
          return (
            activeTransaction?.steps.find((s) => s.id === step)?.status ===
            "loading"
          );
        }) || 2;

      // Update the failed step with error message
      updateStep(currentStep, "error", errorMessage);
      updateStatus("error");

      // Add warning if it's a specific type of error
      if (error instanceof Error && error.message.includes("insufficient")) {
        addWarning("Insufficient balance for transaction");
      }
    } finally {
      transactionStatus.onEnd();
    }
  };
  return (
    <Dialog open={showTaskDetailsModal} onOpenChange={setShowTaskDetailsModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            {project.title} • 8 hours estimated • {task.paymentAmount} SOL
            reward
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center">
          {task.assignee ? (
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage
                  src={task.assignee.profilePicture}
                  alt={task.assignee.username}
                />
                <AvatarFallback>
                  {task.assignee.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{task.assignee.username}</p>
                <p className="text-xs text-muted-foreground">
                  {task.assignee.walletAddress}
                </p>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm">
              Apply for Task
            </Button>
          )}
        </div>

        {task.status === "ready" && (
          <LoaderButton
            isLoading={transactionStatus.isProcessing}
            onClick={handleCompleteTask}
            size="sm"
            disabled={publicKey?.toString() !== task.assignee?.walletAddress}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark Complete
          </LoaderButton>
        )}
        {task.status === "completed" &&
          project.members.some(
            (member) => member.walletAddress === publicKey?.toString()
          ) && (
            <LoaderButton
              isLoading={transactionStatus.isProcessing}
              onClick={handleEnableTaskWithdraw}
              size="sm"
              disabled={publicKey?.toString() === task.assignee?.walletAddress}
            >
              Enable task withdraw
            </LoaderButton>
          )}
        {task.status === "completed" &&
          project.members.some(
            (member) => member.walletAddress === publicKey?.toString()
          ) && (
            <LoaderButton
              isLoading={transactionStatus.isProcessing}
              onClick={handleWithdrawTaskFunds}
              size="sm"
              disabled={publicKey?.toString() !== task.assignee?.walletAddress}
            >
              Withdraw task funds
            </LoaderButton>
          )}
      </DialogContent>
    </Dialog>
  );
}

export default ProjectTaskModal;
