"use client";
import { useUserRegistrationModal } from "@/hooks/use-registration-modall";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { SignIn, SignUp, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const UserRegistrationModal = () => {
  const { isLoaded, userId } = useAuth();
  const userRegistrationModal = useUserRegistrationModal();

  useEffect(() => {
    if (userId || window.location.hash !== "#/continue") {
      userRegistrationModal.onClose();
    }
  }, [userId]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Dialog
      open={userRegistrationModal.isOpen}
      onOpenChange={userRegistrationModal.onClose}
    >
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-md pt-2"
      >
        <div className="leading-2">
          <h3 className="font-semibold mt-5 text-2xl">Create a username</h3>
          <p>Create a unique username for your account.</p>
        </div>

        <SignUp
          routing="virtual"
          appearance={{
            elements: {
              card: "p-1 shadow-none",
              cardBox: "shadow-none",
              footer: "hidden",
              header: "hidden",
              socialButtons: "hidden",
              dividerRow: "hidden",
              formFieldInput: "h-[50px] text-lg focus:shadow-none",
              formButtonPrimary:
                "h-[40px] bg-theme hover:bg-theme/90 text-lg dark:text-white font-semibold",
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UserRegistrationModal;
