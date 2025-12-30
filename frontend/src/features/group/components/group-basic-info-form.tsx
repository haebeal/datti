"use client";

import { useActionState } from "react";
import { updateGroup } from "@/features/group/actions/updateGroup";
import type { Group } from "@/features/group/types";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
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

  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
    >
      <h2 className={cn("text-lg font-semibold")}>基本情報</h2>

      <input
        type="hidden"
        name={id.name}
        value={group.id}
        readOnly
      />

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

      <p className="text-sm">作成者: {group.createdBy}</p>

      <p className="text-sm">
        作成日: {new Date(group.createdAt).toLocaleString("ja-JP")}
      </p>

      <p className="text-sm">
        更新日: {new Date(group.updatedAt).toLocaleString("ja-JP")}
      </p>

      <div className={cn("flex justify-end gap-5")}>
        <Button
          type="button"
          isDisabled={true}
          color="error"
          colorStyle="outline"
        >
          グループ削除
        </Button>
        <Button type="submit" isDisabled={isUpdating}>
          {isUpdating ? "更新中..." : "更新"}
        </Button>
      </div>
    </form>
  );
}
