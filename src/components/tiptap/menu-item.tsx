"use client";

import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const MenuItem = ({
  icon,
  title,
  action,
  isActive,
}: {
  icon?: React.ReactNode;
  title?: string;
  action?: () => void;
  isActive?: () => boolean;
}) => (
  <Button
    className={cn(
      "h-6 px-1.5 md:h-8 md:px-2",
      [
        "Heading 1",
        "Code",
        "Code Block",
        "Task List",
        "Hard Break",
        "Clear Format",
      ].includes(title!) && "hidden lg:block"
    )}
    onClick={(e) => {
      e.preventDefault();
      action && action();
    }}
    title={title}
    variant={isActive && isActive() ? "default" : "link"}
  >
    {icon}
  </Button>
);

export default MenuItem;
