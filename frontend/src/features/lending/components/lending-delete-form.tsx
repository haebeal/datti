"use client";

import { useActionState, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/error-text";
import { ConfirmDialog } from "@/components/ui/dialog";
import {
  deleteLending,
  type DeleteLendingState,
} from "../actions/deleteLending";

type Props = {
  groupId: string;
  lendingId: string;
};

export function LendingDeleteForm({ groupId, lendingId }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isDeleting] = useActionState<DeleteLendingState, FormData>(
    deleteLending.bind(null, groupId, lendingId),
    undefined,
  );

  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <>
      <form
        ref={formRef}
        action={action}
        className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
      >
        <h2 className={cn("text-lg font-semibold")}>イベントを削除</h2>
        <p className={cn("text-sm text-gray-600")}>
          削除すると元に戻せません
        </p>

        {state?.error && <ErrorText>{state.error}</ErrorText>}

        <div className={cn("flex justify-end")}>
          <Button
            type="button"
            color="error"
            isDisabled={isDeleting}
            onPress={() => setIsDialogOpen(true)}
          >
            削除
          </Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="イベントを削除"
        message="このイベントを削除してもよろしいですか？"
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        onConfirm={handleConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
