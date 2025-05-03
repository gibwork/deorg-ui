import { create } from "zustand";
import { toast } from "sonner";
import { TransactionToast } from "./transaction-toast";
import type {
  TransactionStatus,
  TransactionStep,
  TransactionToastProps,
} from "./transaction-toast";

type StepStatus = "pending" | "loading" | "success" | "error";

export type TransactionData = {
  id: string;
  title: string;
  status: TransactionStatus;
  txHash?: string;
  txId?: string;
  steps: TransactionStep[];
  warnings: string[];
  timestamp: number;
};

type TransactionStore = {
  activeTransaction: TransactionData | null;
  setActiveTransaction: (transaction: TransactionData | null) => void;
  updateStatus: (status: TransactionStatus) => void;
  updateStep: (stepId: number, status: StepStatus, message?: string) => void;
  setTxHash: (txHash: string) => void;
  addWarning: (warning: string) => void;
  resetTransaction: () => void;
  startTransaction: (title: string, warnings?: string[]) => string;
  retryTransaction: () => void;
};

// Default steps for escrow deposit flow
const DEFAULT_STEPS: TransactionStep[] = [
  {
    id: 1,
    title: "Preparing transaction",
    status: "loading" as StepStatus,
  },
  {
    id: 2,
    title: "Waiting for signature",
    status: "pending" as StepStatus,
  },
  {
    id: 3,
    title: "Submitting to network",
    status: "pending" as StepStatus,
  },
  {
    id: 4,
    title: "Confirming deposit",
    status: "pending" as StepStatus,
  },
];

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  activeTransaction: null,

  setActiveTransaction: (transaction) =>
    set({ activeTransaction: transaction }),

  updateStatus: (status) => {
    const { activeTransaction } = get();
    if (!activeTransaction) return;

    const updatedTransaction = {
      ...activeTransaction,
      status,
    };

    set({ activeTransaction: updatedTransaction });

    // Update the toast
    updateToast(updatedTransaction);

    // Only reset the transaction if it's completed (success or error)
    if (status === "success" || status === "error") {
      setTimeout(() => {
        toast.dismiss(activeTransaction.id);
        // Don't reset the transaction immediately, let the UI handle it
      }, 5000);
    }
  },

  updateStep: (stepId, status: StepStatus, message?: string) => {
    const { activeTransaction } = get();

    if (!activeTransaction) return;

    const updatedSteps = activeTransaction.steps.map((step) =>
      step.id === stepId ? { ...step, status, message } : step
    );

    const updatedTransaction = {
      ...activeTransaction,
      steps: updatedSteps,
    };

    set({ activeTransaction: updatedTransaction });

    // Update the toast
    updateToast(updatedTransaction);
  },

  setTxHash: (txHash) => {
    const { activeTransaction } = get();
    if (!activeTransaction) return;

    const updatedTransaction = {
      ...activeTransaction,
      txHash,
    };

    set({ activeTransaction: updatedTransaction });

    // Update the toast
    updateToast(updatedTransaction);
  },

  addWarning: (warning) => {
    const { activeTransaction } = get();
    if (!activeTransaction) return;

    if (!activeTransaction.warnings.includes(warning)) {
      const updatedTransaction = {
        ...activeTransaction,
        warnings: [...activeTransaction.warnings, warning],
      };

      set({ activeTransaction: updatedTransaction });

      // Update the toast
      updateToast(updatedTransaction);
    }
  },

  resetTransaction: () => {
    set({ activeTransaction: null });
  },

  startTransaction: (title, warnings = []) => {
    const id = Math.random().toString(36).substring(2, 9);
    const txId = `Tx1`;
    const transaction: TransactionData = {
      id,
      title,
      status: "pending" as TransactionStatus,
      txId,
      steps: [...DEFAULT_STEPS],
      warnings,
      timestamp: Date.now(),
    };
    set({ activeTransaction: transaction });
    toast.custom(
      (t) => {
        const props: TransactionToastProps = {
          title: transaction.title,
          status: transaction.status,
          txHash: transaction.txHash,
          txId: transaction.txId,
          steps: transaction.steps,
          warnings: transaction.warnings,
          onRetry: () => get().retryTransaction(),
        };
        return <TransactionToast {...props} />;
      },
      { id, duration: Number.POSITIVE_INFINITY }
    );
    return id;
  },

  retryTransaction: () => {
    const { activeTransaction } = get();
    if (!activeTransaction || activeTransaction.status !== "error") return;

    // Reset all steps to pending
    const resetSteps = activeTransaction.steps.map((step) => ({
      ...step,
      status: "pending" as StepStatus,
      message: undefined,
    }));

    // Set the first step to loading
    if (resetSteps[0]) {
      resetSteps[0].status = "loading" as StepStatus;
    }

    const updatedTransaction: TransactionData = {
      ...activeTransaction,
      status: "pending" as TransactionStatus,
      steps: resetSteps,
      timestamp: Date.now(),
    };

    set({ activeTransaction: updatedTransaction });

    // Update the toast
    updateToast(updatedTransaction);
  },
}));

// Helper function to update the toast with the current transaction data
function updateToast(transaction: TransactionData) {
  const props: TransactionToastProps = {
    title: transaction.title,
    status: transaction.status,
    txHash: transaction.txHash,
    txId: transaction.txId,
    steps: transaction.steps,
    warnings: transaction.warnings,
    onRetry: () => useTransactionStore.getState().retryTransaction(),
  };

  // Update the toast with the new props
  toast.custom((t) => <TransactionToast {...props} />, {
    id: transaction.id,
    duration: Number.POSITIVE_INFINITY,
  });
}
