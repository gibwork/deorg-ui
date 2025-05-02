import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    toast: (props: {
      title: string;
      description: string;
      variant?: "default" | "destructive";
    }) => {
      sonnerToast[props.variant === "destructive" ? "error" : "success"](
        props.title,
        {
          description: props.description,
        }
      );
    },
  };
}
