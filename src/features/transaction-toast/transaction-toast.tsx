"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type TransactionStatus = "pending" | "processing" | "success" | "error";

export type TransactionStep = {
  id: number;
  title: string;
  status: "pending" | "loading" | "success" | "error";
  message?: string;
};

export interface TransactionToastProps {
  title: string;
  status: TransactionStatus;
  txHash?: string;
  txId?: string;
  steps: TransactionStep[];
  warnings?: string[];
  onRetry?: () => void;
}

export function TransactionToast({
  title,
  status,
  txHash,
  txId,
  steps,
  warnings = [],
  onRetry,
}: TransactionToastProps) {
  // Calculate progress percentage based on completed steps
  const completedSteps = steps.filter(
    (step) => step.status === "success"
  ).length;
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  // Get the current active step (the one that's loading)
  const currentStep = steps.find((step) => step.status === "loading");

  return (
    <div className="w-full max-w-md bg-background border rounded-lg shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {status === "pending" || status === "processing" ? (
              <Clock className="h-5 w-5 text-theme" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <h3 className="font-medium">{title}</h3>
          </div>
          {/* {txId && (
            <span className="text-xs text-muted-foreground">{txId}</span>
          )} */}
        </div>

        {/* Transaction Hash */}
        {txHash && (
          <div className="flex items-center justify-between mb-3 bg-muted p-2 rounded text-xs">
            <code className="font-mono truncate max-w-[200px]">{txHash}</code>
            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
              <a
                href={`https://explorer.solana.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View on Solana Explorer"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        )}

        {/* Progress Bar */}
        {/* {(status === "pending" || status === "processing") && (
          <div className="mb-3">
            <Progress value={progressPercentage} className="h-1" />
          </div>
        )} */}

        {/* Current Step */}
        {/* {currentStep && (
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="h-4 w-4 animate-spin text-theme" />
            <p className="text-sm">{currentStep.title}</p>
            {currentStep.message && (
              <p className="text-xs text-muted-foreground">
                {currentStep.message}
              </p>
            )}
          </div>
        )} */}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-3 p-2 bg-amber-50 text-amber-800 rounded-md text-xs dark:bg-amber-900/20 dark:text-amber-400">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="flex items-start gap-1 mb-1 last:mb-0"
              >
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {status === "error" && (
          <div className="mb-3">
            <div className="p-2 bg-red-50 text-red-800 rounded-md text-xs dark:bg-red-900/20 dark:text-red-400">
              {steps.find((step) => step.status === "error")?.message ||
                "Transaction failed"}
            </div>
            {/* {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  onRetry();
                }}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry Transaction
              </Button>
            )} */}
          </div>
        )}

        {/* Steps List */}
        <div className="space-y-1">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className="flex items-center gap-2"
              data-step={step.id}
              data-status={step.status}
            >
              {step.status === "pending" ? (
                <Clock className="h-3 w-3 text-muted-foreground" />
              ) : step.status === "loading" ? (
                <Loader2 className="h-3 w-3 animate-spin text-theme" />
              ) : step.status === "success" ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <AlertCircle className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`text-sm ${
                  step.status === "pending"
                    ? "text-muted-foreground text-xs"
                    : step.status === "loading"
                    ? "text-theme"
                    : step.status === "success"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
