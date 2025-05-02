"use client";
import { LoaderButton } from "@/components/loader-button";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function DisconnectDecafWallet({
  isOpen,
  setIsOpen,
  title,
  description,
  onConfirm,
  confirmText = "Disconnect",
  isPending,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  isPending: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Disconnect Decaf Wallet</Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className=""
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="">
          {description}

          <div className="flex justify-center gap-3 mt-3">
            <LoaderButton
              variant="outline"
              className="w-full "
              onClick={onConfirm}
              isLoading={isPending}
            >
              {confirmText}
            </LoaderButton>
            <DialogClose asChild>
              <Button className="w-full">Cancel</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DisconnectDecafWallet;
