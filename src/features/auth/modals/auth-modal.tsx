"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { update } from "@intercom/messenger-js-sdk";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
} from "@/components/ui/drawer";

import { useAuthModal } from "@/hooks/use-auth-modal";
import { Check, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import SignUpComponent from "../components/sign-up-component";
import SignInComponent from "../components/sign-in-component";
import { useMediaQuery } from "usehooks-ts";
import { useTransactionStatus } from "@/hooks/use-transaction-status";

const AuthModal = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const transaction = useTransactionStatus();
  const authModal = useAuthModal();
  const { userId } = useAuth();

  const doNothing = () => {};

  if (!authModal.isOpen || userId) return null;

  if (isMobile) {
    return (
      <Drawer
        open={authModal.isOpen}
        onOpenChange={(open) => (open ? authModal.onOpen() : doNothing())}
        dismissible={transaction.isProcessing ? false : true}
      >
        <DrawerContent
          className=""
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DrawerHeader>
            <DrawerClose
              onClick={authModal.onClose}
              className="absolute right-4 top-4 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary"
            >
              <X className="h-5 w-5" />
            </DrawerClose>
          </DrawerHeader>

          <div>
            <AuthComponent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={authModal.isOpen} onOpenChange={authModal.onClose}>
      <DialogHeader>
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="w-full max-w-md lg:max-w-3xl  shadow-sm !p-0"
      >
        <AuthComponent />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;

const AuthComponent = () => {
  const [isSignupToggled, toggleSignup] = useState<boolean>(false);
  useEffect(() => {
    // Hide Intercom launcher
    update({ hide_default_launcher: true });

    return () => update({ hide_default_launcher: false });
  }, []);
  return (
    <div className="w-full lg:min-h-[500px] 2xl:min-h-[600px] lg:grid lg:grid-cols-2  ">
      <div className="hidden lg:block relative h-full ">
        <Image
          src="/images/auth_bg_image.jpeg"
          width={500}
          height={1000}
          alt=""
          className="h-full object-cover object-center rounded-l-lg "
          priority
        />

        <div className="absolute top-5 left-5 flex flex-col gap-5 text-white">
          <h2 className="text-2xl xl:text-3xl font-semibold ">
            Find Talent, Find Work
          </h2>
          <div className="flex flex-col gap-3 font-medium ">
            <p className="flex gap-1.5 ">
              <div className="w-5 mt-1.5">
                <Check className="size-4 " />
              </div>
              <span className="">
                Global access to talent and business, without traditional
                barriers.
              </span>
            </p>
            <p className="flex gap-1.5 ">
              <div className="w-5 mt-1.5">
                <Check className="size-4 " />
              </div>
              <span className="">
                Access the best crypto work opportunities in a single
                marketplace.
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center pb-5 md:p-5">
        <div className="mx-auto grid max-w-xs md:w-full">
          {isSignupToggled ? (
            <SignUpComponent toggleSignup={toggleSignup} />
          ) : (
            <SignInComponent toggleSignup={toggleSignup} />
          )}
        </div>

        <div className="mt-5 lg:mt-0 px-5 flex flex-col grow items-center md:items-end justify-end">
          <span className="text-center text-xs md:text-sm text-muted-foreground">
            {" "}
            By registering, you confirm that you accept our{" "}
            <Link
              href="https://legal.gib.work/privacy-policy.pdf"
              prefetch={false}
              rel="noopener noreferrer"
              target="_blank"
              className={" text-blue-400 cursor-pointer "}
            >
              Privacy Policy.
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};
