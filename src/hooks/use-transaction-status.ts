import { ModalStore } from "@/types/types.modal";
import { create } from "zustand";
export type TransactionStatusStore = {
  isProcessing: boolean;
  onStart: () => void;
  onEnd: () => void;
};

export const useTransactionStatus = create<TransactionStatusStore>((set) => ({
  isProcessing: false,
  onStart: () => set({ isProcessing: true }),
  onEnd: () => set({ isProcessing: false }),
}));
