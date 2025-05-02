import { create } from "zustand";

export type ModalStore = {
  isOpen: boolean;
  claimId: string | null;
  claimType: "questions" | "bounties" | "tasks" | null;
  onOpen: (claimType: "questions" | "bounties" | "tasks" , claimId: string) => void;
  onClose: () => void;
};

export const useClaimModal = create<ModalStore>((set) => ({
  isOpen: false,
  claimId: null,
  claimType: null,
  vaultId: null,
  onOpen: (claimType, claimId) => set({ isOpen: true, claimType, claimId }),
  onClose: () => set({ isOpen: false, claimId: null, claimType: null }),
}));
