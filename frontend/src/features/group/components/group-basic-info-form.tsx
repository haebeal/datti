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
};

export function GroupBasicInfoForm({ group }: Props) {
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
  const [_deleteState, deleteAction, isDeleting] =
    useActionState<DeleteGroupState, FormData>(
      deleteGroup.bind(null, group.id),
      undefined,
    );

  const handleDeleteConfirm = () => {
    deleteFormRef.current?.requestSubmit();
  };

  return (
    <>
      <form
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
      >
        <h2 className={cn("text-lg font-semibold")}>基本情報</h2>

        <input type="hidden" name={id.name} value={group.id} readOnly />

        <label htmlFor={name.id} className={cn("text-sm")}>
          グループ名
        </label>

        <Input
          type="text"
          name={name.name}
          id={name.id}
          key={name.key}
          defaultValue={name.defaultValue}
          className={cn("w-full")}
        />

        <hr />

        <p className="text-sm">作成者: {group.creator.name}</p>

        <p className="text-sm">
          作成日: {new Date(group.createdAt).toLocaleString("ja-JP")}
        </p>

        <p className="text-sm">
          更新日: {new Date(group.updatedAt).toLocaleString("ja-JP")}
        </p>

        <div className={cn("flex justify-end gap-5")}>
          <Button
            type="button"
            isDisabled={isDeleting}
            color="error"
            colorStyle="outline"
            onPress={() => setIsDialogOpen(true)}
          >
            グループ削除
          </Button>
          <Button type="submit" isDisabled={isUpdating}>
            {isUpdating ? "更新中..." : "更新"}
          </Button>
        </div>
      </form>

      <form ref={deleteFormRef} action={deleteAction} className="hidden">
        {/* 削除用の非表示フォーム */}
      </form>

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
