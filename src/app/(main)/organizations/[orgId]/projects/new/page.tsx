import React from "react";
import CreateProjectForm from "./create-project-form";
import { ScrollArea } from "@/components/ui/scroll-area";

function page() {
  return (
    <ScrollArea className="h-full pb-20">
      <CreateProjectForm />
    </ScrollArea>
  );
}

export default page;
