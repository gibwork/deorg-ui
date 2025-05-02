import { create } from "zustand";

export type ModalStore = {
  isOpen: boolean;
  questionId: string | null;
  answerId: string | null;
  onOpen: (questionId: string, answerId: string) => void;
  onClose: () => void;
};

export const useApproveModal = create<ModalStore>((set) => ({
  isOpen: false,
  questionId: null,
  answerId: null,
  onOpen: (questionId, answerId) => set({ isOpen: true, questionId, answerId }),
  onClose: () => set({ isOpen: false, questionId: null, answerId: null }),
}));
