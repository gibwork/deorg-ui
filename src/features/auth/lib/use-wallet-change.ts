import { create } from "zustand";

export type ModalStore = {
  isManualChange: boolean;
  isVerifying: boolean;
  toggleManualChange: (value: boolean) => void;
  toggleVerifying: (value: boolean) => void;
};

export const useWalletChange = create<ModalStore>((set) => ({
  isManualChange: false,
  isVerifying: false,
  toggleManualChange: (value: boolean) =>
    set({
      isManualChange: value,
    }),
  toggleVerifying: (value: boolean) =>
    set({
      isVerifying: value,
    }),
}));
