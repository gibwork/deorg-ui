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

function ChangeDecafWallet({
  isOpen,
  setIsOpen,
  title,
  description,
  onConfirm,
  confirmText = "Chnange",
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
        <Button>Change Decaf Wallet</Button>
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
            <DialogClose asChild>
              <Button className="w-full" variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <LoaderButton
              className="w-full "
              onClick={onConfirm}
              isLoading={isPending}
            >
              {confirmText}
            </LoaderButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ChangeDecafWallet;
