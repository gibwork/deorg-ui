import { BugIcon } from "lucide-react";
import React from "react";
import Link from "next/link";

function ReportBugButton() {
  return (
    <Link
      href="https://discord.gg/KnKvp8hsrb"
      target="_blank"
      rel="noopener noreferrer"
      className="absolute bottom-5 right-5 hidden md:flex items-center gap-2 text-xs bg-muted border rounded-md px-3 py-1.5 hover:scale-105 transition-all duration-150 ease-in-out"
    >
      <BugIcon className="size-4" />
      REPORT A BUG
    </Link>
  );
}

export default ReportBugButton;
