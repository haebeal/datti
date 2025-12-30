"use client";

import { useActionState } from "react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/error-text";
import {
  deleteLending,
  type DeleteLendingState,
} from "../actions/deleteLending";

type Props = {
  groupId: string;
  lendingId: string;
};

export function LendingDeleteForm({ groupId, lendingId }: Props) {
  const [state, action, isDeleting] = useActionState<DeleteLendingState>(
    deleteLending.bind(null, groupId, lendingId),
    undefined,
  );

  return (
    <form
      action={action}
      className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
    >
      <h2 className={cn("text-lg font-semibold")}>立て替えを削除</h2>
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
