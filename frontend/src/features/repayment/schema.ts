import { z } from "zod";

export const createRepaymentSchema = z.object({
  debtorId: z.string().min(1, "返済先を選択してください"),
  amount: z.coerce.number().min(1, "金額は1以上である必要があります"),
});

export const updateRepaymentSchema = z.object({
  amount: z.coerce.number().min(1, "金額は1以上である必要があります"),
});
