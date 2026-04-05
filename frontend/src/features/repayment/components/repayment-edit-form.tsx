"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/error-text";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { updateRepayment } from "../actions/updateRepayment";
import { updateRepaymentSchema } from "../schema";
import type { Repayment } from "../types";

type Props = {
  repayment: Repayment;
};

export function RepaymentEditForm({ repayment }: Props) {
  const [lastResult, action, isUpdating] = useActionState(
    updateRepayment.bind(null, repayment.id),
    undefined,
  );

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      amount: repayment.amount,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateRepaymentSchema });
    },
    shouldRevalidate: "onInput",
  });

  const debtorName = repayment.debtor.name;

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
      <h2
        className={cn("text-base lg:text-xl font-semibold text-primary-base")}
      >
        返済情報を編集
      </h2>

      <div className={cn("flex flex-col gap-1.5")}>
        <label
          htmlFor="repayment-debtor"
          className={cn("text-xs font-medium text-primary-base")}
        >
          相手
        </label>
        <Input
          type="text"
          id="repayment-debtor"
          value={debtorName}
          readOnly
          className={cn(
            "w-full",
            "bg-gray-50 text-gray-600 cursor-not-allowed",
          )}
        />
      </div>

      <div className={cn("flex flex-col gap-1.5")}>
        <label
          htmlFor={fields.amount.id}
          className={cn("text-xs font-medium text-primary-base")}
        >
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
      </div>

      {form.errors && <ErrorText>{form.errors}</ErrorText>}

      <div className={cn("flex justify-end")}>
        <Button type="submit" isDisabled={isUpdating}>
          {isUpdating ? "更新中..." : "更新"}
        </Button>
      </div>
    </form>
  );
}
