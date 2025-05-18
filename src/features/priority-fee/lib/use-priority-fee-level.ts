import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
export type PriorityFeeLevel = "Medium" | "High" | "VeryHigh";
export type PriorityFeeLevelLabel = "Fast" | "Turbo" | "Ultra";

export interface PriorityState {
  selectedPriority: PriorityFeeLevel;
  exactPriorityFee: number;
  maxPriorityFee: number;
  isPriorityFeeModeMaxCap: boolean;
  setPriority: (priority: PriorityFeeLevel) => void;
  setExactPriorityFee: (priority: number) => void;
  setMaxPriorityFee: (priority: number) => void;
  togglePriorityFeeMode: (value: boolean) => void;
}

const DEFAULT_PRIORITY: PriorityFeeLevel = "VeryHigh";
export const usePriorityFeeLevelStore = create<PriorityState>()(
  persist(
    (set) => ({
      selectedPriority: DEFAULT_PRIORITY,
      exactPriorityFee: 0.004,
      maxPriorityFee: 0.004,
      isPriorityFeeModeMaxCap: true,
      setPriority: (priority) => set({ selectedPriority: priority }),
      setExactPriorityFee: (priority) => set({ exactPriorityFee: priority }),
      setMaxPriorityFee: (priority) => set({ maxPriorityFee: priority }),
      togglePriorityFeeMode: (value: boolean) =>
        set({ isPriorityFeeModeMaxCap: value }),
    }),
    {
      name: "deorg-priority-fee",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
