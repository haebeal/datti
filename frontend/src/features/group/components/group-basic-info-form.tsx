"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  type DeleteGroupState,
  deleteGroup,
} from "@/features/group/actions/deleteGroup";
import { updateGroup } from "@/features/group/actions/updateGroup";
import type { Group } from "@/features/group/types";
import { cn } from "@/utils/cn";
import { updateGroupSchema } from "../schema";

type Props = {
  group: Group;
  currentUserId: string;
};

export function GroupBasicInfoForm({ group, currentUserId }: Props) {
  const isCreator = group.creator.id === currentUserId;
  const [lastResult, action, isUpdating] = useActionState(
    updateGroup,
    undefined,
  );
  const [form, { id, name }] = useForm({
    lastResult,
    defaultValue: group,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateGroupSchema });
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const [_deleteState, deleteAction, isDeleting] = useActionState<
    DeleteGroupState,
    FormData
  >(deleteGroup.bind(null, group.id), undefined);

  const handleDeleteConfirm = () => {
    deleteFormRef.current?.requestSubmit();
  };

  return (
    <>
      {/* グループ情報 */}
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        className={cn(
          "p-5 lg:p-8",
          "flex flex-col gap-4 lg:gap-5",
          "bg-white border border-gray-200 rounded-xl",
          "w-full max-w-[640px]",
        )}
      >
        <h2 className={cn("text-base lg:text-xl font-semibold text-primary-base")}>
          グループ情報
        </h2>

        <input type="hidden" name={id.name} value={group.id} readOnly />

        <div className={cn("flex flex-col gap-1.5")}>
          <label
            htmlFor={name.id}
            className={cn("text-xs font-medium text-primary-base")}
          >
            グループ名
          </label>
          <Input
            type="text"
            name={name.name}
            id={name.id}
            key={name.key}
            defaultValue={name.defaultValue}
            className={cn("w-full")}
            disabled={!isCreator}
          />
        </div>

        {isCreator && (
          <div className={cn("flex justify-end")}>
            <Button type="submit" isDisabled={isUpdating}>
              {isUpdating ? "更新中..." : "更新"}
            </Button>
          </div>
        )}
      </form>

      {/* 危険な操作 */}
      {isCreator && (
        <div
          className={cn(
            "p-5 lg:p-8",
            "flex flex-col gap-3 lg:gap-4",
            "bg-white border border-gray-200 rounded-xl",
            "w-full max-w-[640px]",
          )}
        >
          <h2 className={cn("text-base lg:text-xl font-semibold text-error-base")}>
            危険な操作
          </h2>
          <p className={cn("text-sm text-gray-500")}>
            グループを削除すると、すべてのデータが失われます。この操作は取り消せません。
          </p>
          <div className={cn("flex justify-end")}>
            <Button
              type="button"
              isDisabled={isDeleting}
              color="error"
              colorStyle="fill"
              onPress={() => setIsDialogOpen(true)}
            >
              グループを削除
            </Button>
          </div>
        </div>
      )}

      <form ref={deleteFormRef} action={deleteAction} className="hidden" />

      <ConfirmDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="グループを削除"
        message="このグループを削除してもよろしいですか？グループに関連する全てのイベントと立て替え記録も削除されます。"
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
