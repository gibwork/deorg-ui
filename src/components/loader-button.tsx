import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icons } from "./icons";

export function LoaderButton({
  children,
  isLoading,
  className,
  ...props
}: ButtonProps & { isLoading: boolean }) {
  return (
    <Button
      disabled={isLoading}
      type="submit"
      {...props}
      className={cn("flex gap-2 justify-center px-3", className)}
    >
      {isLoading && <Icons.spinner className="animate-spin w-4 h-4" />}
      {children}
    </Button>
  );
}
