"use client";

import LoaderDots from "@/components/loader-dots";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export const LoadingModal = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden border-none shadow-none  bg-transparent"
        hideClose={true}
      >
        <DialogTitle></DialogTitle>
        <div className=" flex items-center justify-center gap-2">
          <LoaderDots />
        </div>
      </DialogContent>
    </Dialog>
  );
};
