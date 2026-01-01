"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorText } from "@/components/ui/error-text";
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

  const payerName = repayment.payerId;
  const debtorName = repayment.debtorId;

  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
    >
      <h2 className={cn("text-lg font-semibold")}>返済情報</h2>

      <div className={cn("flex justify-between items-start gap-6")}>
        <div className={cn("flex-1")}>
          <p className={cn("text-sm text-gray-600")}>返済者</p>
          <p className={cn("text-lg font-semibold")}>{payerName}</p>
        </div>
        <div className={cn("flex-1 text-right")}>
          <p className={cn("text-sm text-gray-600")}>返済先</p>
          <p className={cn("text-lg font-semibold")}>{debtorName}</p>
        </div>
      </div>

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
        <Button type="submit" isDisabled={isUpdating}>
          {isUpdating ? "更新中..." : "更新"}
        </Button>
      </div>
    </form>
  );
}
