"use client";
import { useEffect } from "react";
import { useReferralStore } from "../lib/use-referral-store";

export default function ReferralHandler() {
  const setReferral = useReferralStore((state) => state.setReferral);
  const referralCode = useReferralStore((state) => state.referralCode);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referral = urlParams.get("referral");
    const ref = urlParams.get("ref");

    if (referral) {
      // Save to storage and Zustand
      setReferral(referral);
    } else if (ref) {
      setReferral(ref);
    } else {
      // Load from storage if not in URL

      if (referralCode) {
        setReferral(referralCode);
      }
    }
  }, [setReferral]);

  return null; // This component is just for logic, doesn't render UI
}
