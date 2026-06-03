import { z } from "zod";

export const createRepaymentSchema = z.object({
	debtorId: z.string().min(1, "返済先を選択してください"),
	amount: z.number().min(1, "金額は1以上である必要があります"),
});

export const updateRepaymentSchema = z.object({
	amount: z.number().min(1, "金額は1以上である必要があります"),
});

export type CreateRepaymentInput = z.infer<typeof createRepaymentSchema>;
export type UpdateRepaymentInput = z.infer<typeof updateRepaymentSchema>;
