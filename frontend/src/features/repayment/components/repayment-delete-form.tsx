"use client";

import { useActionState } from "react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/error-text";
import {
  deleteRepayment,
  type DeleteRepaymentState,
} from "../actions/deleteRepayment";

type Props = {
  repaymentId: string;
};

export function RepaymentDeleteForm({ repaymentId }: Props) {
  const [state, action, isDeleting] = useActionState<DeleteRepaymentState>(
    deleteRepayment.bind(null, repaymentId),
    undefined,
  );

  return (
    <form
      action={action}
      className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
    >
      <h2 className={cn("text-lg font-semibold")}>返済を削除</h2>
      <p className={cn("text-sm text-gray-600")}>
        削除すると元に戻せません
      </p>

      {state?.error && <ErrorText>{state.error}</ErrorText>}

      <div className={cn("flex justify-end")}>
        <Button type="submit" color="error" isDisabled={isDeleting}>
          {isDeleting ? "削除中..." : "削除"}
        </Button>
      </div>
    </form>
  );
}
