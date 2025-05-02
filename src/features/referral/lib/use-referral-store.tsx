import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ReferralState {
  referralCode: string | null;
  timestamp: number | null;
  setReferral: (code: string) => void;
  clearReferral: () => void;
}

export const useReferralStore = create<ReferralState>()(
  persist(
    (set) => ({
      referralCode: null,
      timestamp: null,

      setReferral: (code: string) => {
        set({
          referralCode: code,
          timestamp: Date.now(),
        });
      },

      clearReferral: () => {
        set({
          referralCode: null,
          timestamp: null,
        });
      },
    }),
    {
      name: "referral-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
