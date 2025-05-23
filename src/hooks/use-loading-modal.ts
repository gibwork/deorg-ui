import { ModalStore } from "@/types/types.modal";
import { create } from "zustand";

export const useLoadingModal = create<ModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
