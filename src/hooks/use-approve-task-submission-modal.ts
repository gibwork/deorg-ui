import { create } from "zustand";

export type ModalStore = {
  isOpen: boolean;
  taskId: string | null;
  taskSubmissionId: string | null;
  onOpen: (taskId: string, taskSubmissionId: string) => void;
  onClose: () => void;
};

export const useApproveTaskSubmissionModal = create<ModalStore>((set) => ({
  isOpen: false,
  taskId: null,
  taskSubmissionId: null,
  onOpen: (taskId, taskSubmissionId) => set({ isOpen: true, taskId, taskSubmissionId }),
  onClose: () => set({ isOpen: false, taskId: null, taskSubmissionId: null }),
}));
