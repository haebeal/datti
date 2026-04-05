"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ErrorText } from "@/components/ui/error-text";
import { formatCurrency } from "@/utils/format";
import type { Credit } from "@/features/credit/types";
import { createRepayment } from "../actions/createRepayment";
import { createRepaymentSchema } from "../schema";

type Props = {
  credits: Credit[];
  defaultDebtorId?: string;
  defaultAmount?: number;
};

export function RepaymentCreateForm({
  credits,
  defaultDebtorId,
  defaultAmount,
}: Props) {
  const [lastResult, action, isCreating] = useActionState(
    createRepayment,
    undefined,
  );

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      debtorId: defaultDebtorId ?? "",
      amount: defaultAmount ?? 0,
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
      className={cn(
        "p-6 lg:p-8",
        "flex flex-col gap-5",
        "bg-white border border-gray-200 rounded-xl",
        "w-full",
      )}
    >
      <h2 className={cn("text-base lg:text-xl font-semibold text-primary-base")}>
        返す相手と金額
      </h2>

      <div className={cn("flex flex-col gap-1.5")}>
        <label
          htmlFor={fields.debtorId.id}
          className={cn("text-xs font-medium text-primary-base")}
        >
          誰に？
        </label>
        <Select<Credit>
          name={fields.debtorId.name}
          id={fields.debtorId.id}
          key={fields.debtorId.key}
          defaultValue={fields.debtorId.initialValue}
          placeholder={
            hasCandidates ? "返す相手を選択" : "返せるユーザーがいません"
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
      </div>

      <div className={cn("flex flex-col gap-1.5")}>
        <label
          htmlFor={fields.amount.id}
          className={cn("text-xs font-medium text-primary-base")}
        >
          いくら？
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
      </div>

      {form.errors && <ErrorText>{form.errors}</ErrorText>}

      <div className={cn("flex justify-end")}>
        <Button type="submit" isDisabled={isCreating || !hasCandidates}>
          {isCreating ? "処理中..." : "返す"}
        </Button>
      </div>
    </form>
  );
}
