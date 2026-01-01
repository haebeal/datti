"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorText } from "@/components/ui/error-text";
import { createGroup } from "../actions/createGroup";
import { createGroupSchema } from "../schema";

export function GroupCreateForm() {
  const [lastResult, action, isCreating] = useActionState(
    createGroup,
    undefined,
  );

  const [form, { name }] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createGroupSchema });
    },
    shouldRevalidate: "onInput",
  });

  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
    >
      <h2 className={cn("text-lg font-semibold")}>グループ情報</h2>

      <label htmlFor={name.id} className={cn("text-sm")}>
        グループ名
      </label>

      <Input
        type="text"
        name={name.name}
        id={name.id}
        key={name.key}
        defaultValue={name.defaultValue}
        placeholder="例: 家族, 友達, 会社"
        className={cn("w-full")}
      />

      {name.errors && <ErrorText>{name.errors}</ErrorText>}

      {form.errors && <ErrorText>{form.errors}</ErrorText>}

      <div className={cn("flex justify-end gap-5")}>
        <Button type="submit" isDisabled={isCreating}>
          {isCreating ? "作成中..." : "作成"}
        </Button>
      </div>
    </form>
  );
}
