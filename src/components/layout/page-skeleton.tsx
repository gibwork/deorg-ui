import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { buttonVariants } from "../ui/button";

export default function SkeletonPage() {
  return (
    <div className=" p-5  ">
      <div className="flex flex-col md:hidden py-2  border-b ">
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
          <div className="py-2 space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-col ">
        <div className="w-1/2 flex items-center gap-1 mb-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="space-y-2 w-full mb-2">
          <div className="flex items-start justify-between gap-2 w-full">
            <div className="w-9/12 space-y-1">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-10/12" />
            </div>
            <Skeleton className="h-6 w-1/12" />
          </div>

          <Skeleton className="h-20 w-2/3" />
          <div className="flex flex-col items-end gap-1 justify-end w-full">
            <Skeleton className="h-6 w-24" />
            <div className="flex items-center gap-1">
              <Skeleton className="w-7 h-7 rounded-full" />

              <Skeleton className="h-5 w-16" />
            </div>
          </div>

          {/* <div className="mt-5">
            <Skeleton className="h-20 w-2/3" />
            <Skeleton className="h-20 w-2/3" />
          </div> */}
        </div>
      </div>
    </div>
  );
}
