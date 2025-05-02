"use client";
import React from "react";
import { AvatarImage } from "./ui/avatar";

const ImageLoader = ({
  src,
  height,
  alt,
  width,
  quality,
  className,
}: {
  src: string;
  alt: String;
  height: number;
  width: number;
  quality: number;
  className?: string;
}) => {
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  return (
    <AvatarImage
      src={`${src}?height=${height}&width=${width}&quality=${quality}`}
      alt={`${alt}`}
      className={` ${className} object-cover object-center  ${
        isLoaded ? "opacity-100" : "opacity-0"
      }  ease-out`}
      onLoad={() => setIsLoaded(true)}
    />
  );
};

export default ImageLoader;
