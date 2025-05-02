import { create } from "zustand";

export type ModalStore = {
  isOpen: boolean;
  responseId: string | null;
  attemptId: string | null;
  onOpen: (responseId: string, attemptId: string) => void;
  onClose: () => void;
};

export const useCreatePRModal = create<ModalStore>((set) => ({
  isOpen: false,
  responseId: null,
  attemptId: null,
  onOpen: (responseId, attemptId) =>
    set({ isOpen: true, responseId, attemptId }),
  onClose: () => set({ isOpen: false, responseId: null, attemptId: null }),
}));
