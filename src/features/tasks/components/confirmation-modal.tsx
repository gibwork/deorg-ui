import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onConfirm: () => void;
  variant?: "warning" | "danger" | "info" | "success";
  // Main modal content
  title: string;
  description?: string | React.ReactNode;
  // Custom list items to show as bullet points
  items?: string[];
  // Button labels
  confirmText?: string;
  cancelText?: string;
  // Optional footer content
  footer?: React.ReactNode;
  // loading state
  isConfirming?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  variant = "warning",
  title,
  description,
  items,
  confirmText,
  cancelText,
  footer,
  isConfirming = false,
}) => {
  // Variant-specific configurations
  const variantConfig = {
    warning: {
      icon: AlertTriangle,
      iconClass: "text-amber-600",
    },
    danger: {
      icon: AlertCircle,
      iconClass: "text-red-600",
    },
    info: {
      icon: Info,
      iconClass: "text-blue-600",
    },
    success: {
      icon: CheckCircle,
      iconClass: "text-green-600",
    },
  };

  const { icon: Icon, iconClass } = variantConfig[variant];

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-start space-x-3">
            <Icon className={cn("h-5 w-5 mt-1", iconClass)} />
            <div className="flex-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description && (
                <AlertDialogDescription className="mt-2">
                  {description}
                </AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>

        {items && items.length > 0 && (
          <div className="mt-2">
            <ul className="list-disc pl-6 space-y-2">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {footer && <div className="mt-2">{footer}</div>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming}>
            {cancelText || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText || "Confirm"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
