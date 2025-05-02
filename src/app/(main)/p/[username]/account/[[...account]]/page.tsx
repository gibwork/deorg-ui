import { ScrollArea } from "@/components/ui/scroll-area";
import { redirect } from "next/navigation";
import UserAccountComponent from "./user-account-component";
import { auth } from "@clerk/nextjs/server";

async function page() {
  const { userId } = auth();
  if (!userId) {
    redirect("/");
  }
  return (
    <ScrollArea className="h-full">
      <UserAccountComponent />
    </ScrollArea>
  );
}

export default page;
