import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { buttonVariants } from "../ui/button";

export default function SkeletonList() {
  return (
    <div className="space-y-2 ">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div className="flex flex-col md:hidden py-2  border-b " key={idx}>
          <div className="flex items-center gap-2 py-1">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex items-center justify-between w-full ">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <div className=" w-full">
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      ))}
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          className="hidden md:flex items-center space-x-2 my-2 border-b "

          key={idx}
        >
          <div className="p-2 me-1 ">
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
          <div className="space-y-2 w-full">
            <Skeleton className="h-6 w-full" />
            <div className="flex items-center justify-between w-full">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
