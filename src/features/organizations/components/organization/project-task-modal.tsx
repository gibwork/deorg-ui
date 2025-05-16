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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
} from "lucide-react";
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
import { formatTokenAmount } from "@/utils/format-amount";
import { cn, truncate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { TaskStatusBadge } from "../projects/project-details-page";
import Link from "next/link";

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
      updateStep(3, "success");
      updateStep(4, "loading", "Confirming transaction...");

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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto ">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full overflow-y-auto">
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground ">
                <span>{truncate(task.accountAddress, 4, 4)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => {
                    navigator.clipboard.writeText(task.accountAddress);
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Link
                  href={`https://explorer.solana.com/address/${task.accountAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "w-5 h-5"
                  )}
                >
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {project.title} • 8 hours estimated •{" "}
                {formatTokenAmount(task.paymentAmount, task.tokenInfo.decimals)}{" "}
                {task.tokenInfo.symbol} reward
              </div>
              <DialogTitle className="flex items-center justify-between text-xl font-semibold">
                {task.title} <TaskStatusBadge status={task.status} />
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm text-muted-foreground  mb-1">
                  Description
                </h3>
                <p className="text-sm font-medium">{task.description}</p>
              </div>

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
                      <p className="text-sm font-medium">
                        {task.assignee.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {truncate(task.assignee.walletAddress, 8, 4)}
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
                  disabled={
                    publicKey?.toString() !== task.assignee?.walletAddress
                  }
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
                    disabled={
                      publicKey?.toString() === task.assignee?.walletAddress
                    }
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
                    disabled={
                      publicKey?.toString() !== task.assignee?.walletAddress
                    }
                  >
                    Withdraw task funds
                  </LoaderButton>
                )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectTaskModal;
