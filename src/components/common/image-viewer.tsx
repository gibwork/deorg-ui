"use client";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import React, { DetailedHTMLProps, ImgHTMLAttributes } from "react";
import { X } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";

export default function ImageViewer({
  src,
  alt,
  className,
}: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  if (!src) return null;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Image
          src={src}
          overrideSrc={src}
          alt={alt || ""}
          className={` ${className} object-cover object-center  ${
            isLoaded ? "opacity-100 " : "opacity-80 bg-border"
          }  transition duration-300 ease-in-out  cursor-pointer rounded-sm`}
          width={500}
          height={100}
          onLoad={() => setIsLoaded(true)}
        />
      </DialogTrigger>
      <DialogContent
        hideClose={true}
        className="border-0 bg-transparent shadow-none !p-0"
      >
        <div className="h-[calc(100vh_-_220px)] md:h-screen w-full  ">
          <DialogClose asChild>
            <button className="fixed top-0 right-0 z-50 py-4">
              <X className=" h-6 w-6 text-muted-foreground hover:text-foreground  " />
            </button>
          </DialogClose>
          <Image
            src={src}
            fill
            alt={alt || ""}
            className=" w-full h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
