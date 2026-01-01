"use client";

import { useActionState } from "react";
import { updateProfile } from "@/features/user/actions/updateProfile";
import type { User } from "@/features/user/types";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { profileEditSchema } from "../schema";

type Props = {
  user: User;
};

export function ProfileEditForm({ user }: Props) {
  const [lastResult, action, isUpdating] = useActionState(
    updateProfile,
    undefined,
  );
  const [form, { id, name, avatar }] = useForm({
    lastResult,
    defaultValue: user,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: profileEditSchema });
    },
  });

  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
    >
      <h2 className={cn("text-lg font-semibold")}>プロフィール編集</h2>

      <input type="hidden" name={id.name} value={user.id} readOnly />

      <label htmlFor={name.id} className={cn("text-sm")}>
        名前
      </label>

      <Input
        type="text"
        name={name.name}
        id={name.id}
        key={name.key}
        defaultValue={name.defaultValue}
        className={cn("w-full")}
      />
      {name.errors && (
        <p className={cn("text-sm text-red-500")}>{name.errors}</p>
      )}

      <label htmlFor={avatar.id} className={cn("text-sm")}>
        アバターURL
      </label>

      <Input
        type="text"
        name={avatar.name}
        id={avatar.id}
        key={avatar.key}
        defaultValue={avatar.defaultValue}
        className={cn("w-full")}
      />
      {avatar.errors && (
        <p className={cn("text-sm text-red-500")}>{avatar.errors}</p>
      )}

      {form.errors && (
        <p className={cn("text-sm text-red-500")}>{form.errors}</p>
      )}

      <div className={cn("flex justify-end")}>
        <Button type="submit" isDisabled={isUpdating}>
          {isUpdating ? "更新中..." : "更新"}
        </Button>
      </div>
    </form>
  );
}
