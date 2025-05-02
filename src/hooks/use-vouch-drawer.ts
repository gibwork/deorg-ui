import { create } from "zustand";

type VouchDrawerStore = {
  isOpen: boolean;
  profileUser: any | null;
  onOpen: (profileUser: any) => void;
  onClose: () => void;
};

export const useVouchDrawer = create<VouchDrawerStore>((set) => ({
  isOpen: false,
  profileUser: null,
  onOpen: (profileUser) => set({ isOpen: true, profileUser }),
  onClose: () => set({ isOpen: false }),
}));
