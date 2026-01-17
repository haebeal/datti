"use client";

import { useActionState, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/error-text";
import { ConfirmDialog } from "@/components/ui/dialog";
import {
  deleteRepayment,
  type DeleteRepaymentState,
} from "../actions/deleteRepayment";

type Props = {
  repaymentId: string;
};

export function RepaymentDeleteForm({ repaymentId }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isDeleting] = useActionState<
    DeleteRepaymentState,
    FormData
  >(deleteRepayment.bind(null, repaymentId), undefined);

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
        <h2 className={cn("text-lg font-semibold")}>返済を削除</h2>
        <p className={cn("text-sm text-gray-600")}>削除すると元に戻せません</p>

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
        title="返済を削除"
        message="この返済を削除してもよろしいですか？"
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        onConfirm={handleConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
