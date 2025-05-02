"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { useWallet } from "@solana/wallet-adapter-react";
import { useMediaQuery } from "usehooks-ts";
import { useWalletSelectModal } from "@/hooks/use-wallet-modal";
import SelectWallet from "./select-wallet";
function SelectWalletModal() {
  const { publicKey } = useWallet();

  const selectWalletModal = useWalletSelectModal();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (publicKey) {
    return null;
  }

  if (isDesktop) {
    return (
      <Dialog
        open={selectWalletModal.isOpen}
        onOpenChange={selectWalletModal.onClose}
      >
        <DialogContent
          className=" max-w-md"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <SelectWallet />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={selectWalletModal.isOpen}
      onOpenChange={selectWalletModal.onClose}
    >
      <DrawerContent
        className=""
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <SelectWallet />
      </DrawerContent>
    </Drawer>
  );
}

export default SelectWalletModal;
