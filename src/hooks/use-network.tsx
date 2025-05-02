import { create } from "zustand";

interface NetworkState {
  network: "mainnet" | "devnet";
  toggleNetwork: () => void;
}

const useNetwork = create<NetworkState>((set) => ({
  network: "mainnet",
  toggleNetwork: () =>
    set((state) => ({
      network: state.network === "mainnet" ? "devnet" : "mainnet",
    })),
}));

export default useNetwork;
