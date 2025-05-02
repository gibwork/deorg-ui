"use client";

import { useWallet } from "@solana/wallet-adapter-react";

import Image from "next/image";
import { motion } from "framer-motion";
function SelectWallet() {
  const { select, wallets, publicKey, disconnect, signTransaction } =
    useWallet();

  return (
    <div className="py-2 px-5 md:!p-0">
      <h3 className="text-center md:text-left text-xl font-bold">
        Connect Wallet
      </h3>

      <div className="flex items-center gap-10 justify-center mt-4">
        {wallets.filter((wallet) => wallet.readyState === "Installed").length >
        0 ? (
          wallets
            .filter((wallet) => wallet.readyState === "Installed")
            .map((wallet) => (
              <motion.button
                key={wallet.adapter.name}
                onClick={() => select(wallet.adapter.name)}
                className="flex flex-col items-center  rounded-lg p-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  height={50}
                  width={50}
                  className="p-2"
                />
                {wallet.adapter.name}
              </motion.button>
            ))
        ) : (
          <span>
            No wallet found. Please download a supported Solana wallet
          </span>
        )}
      </div>

      <div className="mt-10 text-sm text-center">
        DeOrg will never do anything without your approval.
      </div>
    </div>
  );
}

export default SelectWallet;
