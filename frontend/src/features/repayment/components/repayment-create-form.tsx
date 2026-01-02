"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ErrorText } from "@/components/ui/error-text";
import { formatCurrency } from "@/schema";
import type { Credit } from "@/features/credit/types";
import { createRepayment } from "../actions/createRepayment";
import { createRepaymentSchema } from "../schema";

type Props = {
  credits: Credit[];
};

export function RepaymentCreateForm({ credits }: Props) {
  const [lastResult, action, isCreating] = useActionState(
    createRepayment,
    undefined,
  );

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      debtorId: "",
      amount: 0,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createRepaymentSchema });
    },
    shouldRevalidate: "onInput",
  });

  const hasCandidates = credits.length > 0;

  const getCreditLabel = (credit: Credit) => {
    const debtAmount = Math.abs(credit.amount);
    return `${credit.user.name} (借り: ${formatCurrency(debtAmount)})`;
  };

  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
    >
      <h2 className={cn("text-lg font-semibold")}>返済情報</h2>

      <label htmlFor={fields.debtorId.id} className={cn("text-sm")}>
        返済先
      </label>

      <Select<Credit>
        name={fields.debtorId.name}
        id={fields.debtorId.id}
        key={fields.debtorId.key}
        defaultValue={fields.debtorId.initialValue}
        placeholder={
          hasCandidates ? "返済先を選択" : "返済できるユーザーがいません"
        }
        options={credits}
        getOptionLabel={getCreditLabel}
        getOptionValue={(credit) => credit.user.id}
        isError={!!fields.debtorId.errors}
        className={cn("w-full")}
        required
      />

      {fields.debtorId.errors && (
        <ErrorText>{fields.debtorId.errors}</ErrorText>
      )}

      <label htmlFor={fields.amount.id} className={cn("text-sm")}>
        金額
      </label>

      <Input
        type="number"
        name={fields.amount.name}
        id={fields.amount.id}
        key={fields.amount.key}
        defaultValue={fields.amount.initialValue}
        placeholder="0"
        className={cn("w-full")}
      />

      {fields.amount.errors && <ErrorText>{fields.amount.errors}</ErrorText>}

      {form.errors && <ErrorText>{form.errors}</ErrorText>}

      <div className={cn("flex justify-end gap-5")}>
        <Button type="submit" isDisabled={isCreating || !hasCandidates}>
          {isCreating ? "作成中..." : "作成"}
        </Button>
      </div>
    </form>
  );
}
