"use client";

import { useActionState, useState } from "react";
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

  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  const handleAddEmail = () => {
    const trimmed = emailInput.trim();
    if (trimmed && !emails.includes(trimmed)) {
      setEmails([...emails, trimmed]);
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      className={cn(
        "p-6 lg:p-8",
        "flex flex-col gap-5",
        "bg-white border border-gray-200 rounded-xl",
        "w-full max-w-[640px] mx-auto",
      )}
    >
      {/* グループをつくる */}
      <h2 className={cn("text-base lg:text-xl font-semibold text-primary-base")}>
        グループをつくる
      </h2>

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
          placeholder="例: 旅行メンバー"
          className={cn("w-full")}
        />
        {name.errors && <ErrorText>{name.errors}</ErrorText>}
      </div>

      {/* メンバーを招待 */}
      <h2 className={cn("text-base lg:text-xl font-semibold text-primary-base")}>
        メンバーを招待
      </h2>

      <p className={cn("text-xs text-gray-500")}>
        招待するメンバーのメールアドレスを入力してください
      </p>

      <div className={cn("flex items-center gap-2")}>
        <Input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddEmail();
            }
          }}
          placeholder="メールアドレス"
          className={cn("flex-1")}
        />
        <Button
          type="button"
          color="primary"
          colorStyle="fill"
          onPress={handleAddEmail}
          className="bg-accent-base border-accent-base"
        >
          + 追加
        </Button>
      </div>

      {/* 追加済みメールリスト */}
      {emails.length > 0 && (
        <div className={cn("flex flex-wrap gap-2")}>
          {emails.map((email) => (
            <div
              key={email}
              className={cn(
                "flex items-center gap-1.5",
                "px-3 py-1.5",
                "bg-gray-100 rounded-full",
                "text-xs text-primary-base",
              )}
            >
              {email}
              <button
                type="button"
                onClick={() => handleRemoveEmail(email)}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
                aria-label={`${email}を削除`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* hidden inputsでemailsを送信 */}
      {emails.map((email) => (
        <input key={email} type="hidden" name="emails" value={email} />
      ))}

      {form.errors && <ErrorText>{form.errors}</ErrorText>}

      <div className={cn("flex justify-end")}>
        <Button type="submit" isDisabled={isCreating}>
          {isCreating ? "作成中..." : "つくる"}
        </Button>
      </div>
    </form>
  );
}
