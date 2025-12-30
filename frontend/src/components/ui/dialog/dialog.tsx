"use client";

import {
  Dialog as AriaDialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
  type DialogProps as AriaDialogProps,
} from "react-aria-components";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
};

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  message,
  confirmLabel = "削除する",
  cancelLabel = "キャンセル",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/50",
        "flex items-center justify-center",
        "p-4",
      )}
      isDismissable
    >
      <Modal
        className={cn(
          "w-full max-w-md",
          "bg-white",
          "rounded-lg",
          "shadow-xl",
          "outline-none",
        )}
      >
        <AriaDialog className={cn("p-6", "flex flex-col gap-4", "outline-none")}>
          {({ close }) => (
            <>
              <h2 className={cn("text-xl font-bold")}>{title}</h2>
              <p className={cn("text-gray-700")}>{message}</p>
              <div className={cn("flex justify-end gap-3", "mt-2")}>
                <Button
                  onPress={close}
                  colorStyle="outline"
                  color="primary"
                  isDisabled={isLoading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  onPress={() => {
                    onConfirm();
                    close();
                  }}
                  color="error"
                  isDisabled={isLoading}
                >
                  {confirmLabel}
                </Button>
              </div>
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}

export { DialogTrigger };
