"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import { useMediaQuery } from "usehooks-ts";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Icons } from "../icons";
function ShareModal({
  isOpen,
  setIsOpen,
  title,
  description,
  link,
  type,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  description: string;
  link: string;
  type: string;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isOpen) {
    return null;
  }
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ShareComponent link={link} type={type} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="pb-5">
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ShareComponent link={link} type={type} />
      </DrawerContent>
    </Drawer>
  );
}

export default ShareModal;

function ShareComponent({ link, type }: { link: string; type: string }) {
  const shareOnTwitter = () => {
    const tweetText =
      type === "Service"
        ? `I just created a new service on @gib_work  🚀 \n Check it out and let’s collaborate! \n\n`
        : `I just created a new ${type} on @gib_work  🚀 \n Come check it out and start working on it! \n\n`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&url=${encodeURIComponent(link)}`;
    window.open(twitterUrl, "_blank");
  };

  const shareViaEmail = () => {
    const mailtoUrl = `mailto:?subject=Check this ${type}&body=Here's the link: ${link}`;
    window.open(mailtoUrl, "_self");
  };

  return (
    <div className="">
      <div className=" flex items-center gap-2 px-3 sm:px-0">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="link" className="sr-only">
            Link
          </Label>
          <Input id="link" defaultValue={link} readOnly />
        </div>
        <Button
          type="submit"
          size="sm"
          className="px-3"
          onClick={() => {
            navigator.clipboard.writeText(link).then(
              function () {
                /* clipboard successfully set */
                toast.success("Copied to clipboard");
              },
              function () {
                /* clipboard write failed */
                toast.error("Failed to copy to clipboard");
              }
            );
          }}
        >
          <span className="sr-only">Copy</span>
          <CopyIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-row items-center space-x-2 py-2">
        <div className="h-[1px] grow bg-gray-200 dark:bg-zinc-800"></div>
        <div className="text-sm text-muted-foreground">or</div>
        <div className="h-[1px] grow bg-gray-200 dark:bg-zinc-800"></div>
      </div>

      <div className=" flex items-center justify-center gap-3">
        <Button variant="link" onClick={shareViaEmail}>
          <Icons.gmail className="w-6 h-6 sm:w-8 sm:h-8" />
        </Button>
        <Button variant="link" onClick={shareOnTwitter}>
          <Image
            src="/images/img_ico_x.png"
            width={200}
            height={200}
            alt="gib_work"
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
        </Button>
      </div>
    </div>
  );
}
