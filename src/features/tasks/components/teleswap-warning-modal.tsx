"use client";
import React from "react";
import { ConfirmationModal } from "./confirmation-modal";
import { TeleswapTransactionStatus } from "@/types/teleswap.types";
import { CircleAlert, Info } from "lucide-react";

interface TransactionModalConfig {
  title: string;
  description?: string | React.ReactNode;
  items: string[];
  variant: "warning" | "danger" | "info" | "success";
  confirmText: string;
  cancelText: string;
  footer?: React.ReactNode;
}

interface TeleswapWarningModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onConfirm: () => void;
  status: TeleswapTransactionStatus;
  isConfirming?: boolean;
  paymentMethod?: string;
}

export const TeleswapWarningModal: React.FC<TeleswapWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  status,
  isConfirming = false,
  paymentMethod,
}) => {
  const modalConfig: TransactionModalConfig = React.useMemo(() => {
    switch (status) {
      case "WAITING_RECEIVE_FUNDS":
        return {
          title: "Before You Leave",

          items: [
            "If you've already sent funds, your task will be created automatically",
            "If you haven't sent funds yet, this deposit address will become invalid",
            "You'll need to generate a new quote and address if you try again later",
          ],
          variant: "warning",
          confirmText: "Yes, I've Sent Funds",
          cancelText: "No, I Haven't Sent Funds",
          footer: (
            <div className="space-y-3">
              <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 rounded-lg p-3">
                <Info className="w-5 h-5  flex-shrink-0 mt-0.5" />
                <div className="text-sm ">
                  <p className="font-medium">Already sent funds?</p>
                  <p className="mt-1">
                    You can safely leave this page. We&apos;ll create your task
                    automatically once we detect your deposit.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 text-amber-700 dark:text-amber-300 rounded-lg p-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm ">
                  <p className="font-medium">Haven&apos;t sent funds yet?</p>
                  <p className="mt-1">
                    This deposit address will become invalid. You&apos;ll need
                    to start over with a new quote if you decide to proceed
                    later.
                  </p>
                </div>
              </div>
            </div>
          ),
        };

      case "DEPOSIT_DETECTED":
        return {
          title: "Deposit Detected",
          description: (
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium">Your deposit has been detected!</p>
                <p className="text-muted-foreground mt-1">
                  You can safely leave this page - we&apos;ll handle the rest.
                </p>
              </div>
            </div>
          ),
          items: [
            "Your task will be created automatically",
            "You'll receive a notification when it's ready",
            "You can check the status in your dashboard",
          ],
          variant: "info",
          confirmText: "Go to Dashboard",
          cancelText: "Stay on Page",
          footer: (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                Task creation usually takes 5-7 minutes to complete. You&apos;ll
                be notified once it&apos;s ready.
              </p>
            </div>
          ),
        };

      case "CREATED":
        return {
          title: "Task Created Successfully",
          description: "Your task has been created and is now active.",
          items: [
            "All funds have been received and processed",
            "Your task is now visible in the marketplace",
            "You can manage it from your dashboard",
          ],
          variant: "success",
          confirmText: "View Task",
          cancelText: "Close",
        };

      default:
        return {
          title: "Cancel Transaction?",
          description: "Are you sure you want to cancel this transaction?",
          items: [
            "Your progress will be lost",
            "You'll need to start over if you continue later",
            "Any entered information will be cleared",
          ],
          variant: "warning",
          confirmText: "Yes, Cancel",
          cancelText: "Continue",
        };
    }
  }, [status]);

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isConfirming={isConfirming}
      {...modalConfig}
    />
  );
};
