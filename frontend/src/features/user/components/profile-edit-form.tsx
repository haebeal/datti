"use client";

import { useState, useActionState } from "react";
import { updateProfile } from "@/features/user/actions/updateProfile";
import type { User } from "@/features/user/types";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { profileEditSchema } from "../schema";
import { AvatarPicker } from "./avatar-picker";

type Props = {
  user: User;
};

export function ProfileEditForm({ user }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);
  const [lastResult, action, isUpdating] = useActionState(
    updateProfile,
    undefined,
  );
  const [form, { name, avatar }] = useForm({
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
      className={cn(
        "p-6 lg:p-8",
        "flex flex-col gap-5",
        "bg-white border border-gray-200 rounded-xl",
        "w-full max-w-[640px]",
      )}
    >
      <h2 className={cn("text-base lg:text-xl font-semibold text-primary-base")}>
        プロフィール編集
      </h2>

      <div className={cn("flex flex-col gap-2")}>
      <span className={cn("text-xs font-medium text-primary-base")}>アバター</span>

      <AvatarPicker
        currentAvatar={avatarUrl}
        onAvatarChange={setAvatarUrl}
        name={avatar.name}
        id={avatar.id}
      />
      {avatar.errors && (
        <p className={cn("text-sm text-error-base")}>{avatar.errors}</p>
      )}
      </div>

      <div className={cn("flex flex-col gap-1.5")}>
      <label htmlFor={name.id} className={cn("text-xs font-medium text-primary-base")}>
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
        <p className={cn("text-sm text-error-base")}>{name.errors}</p>
      )}
      </div>

      {form.errors && (
        <p className={cn("text-sm text-error-base")}>{form.errors}</p>
      )}

      <div className={cn("flex justify-end")}>
        <Button type="submit" isDisabled={isUpdating}>
          {isUpdating ? "更新中..." : "更新"}
        </Button>
      </div>
    </form>
  );
}
