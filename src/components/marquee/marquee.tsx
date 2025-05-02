"use client";

import "./styles/marquee.css";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};
const Marquee = ({ children }: Props) => {
  return (
    <div className="overflow-hidden w-full  ">
      <div className="flex flex-col gap-4 pb-4  animate-marquee-vertical marquee">
        <div className="flex flex-col flex-1 ">{children}</div>
      </div>
    </div>
  );
};

export default Marquee;
