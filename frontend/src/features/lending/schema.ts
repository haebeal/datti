import { z } from "zod";

/**
 * Zod schemas for lending forms
 */

export const debtSchema = z.object({
	userId: z.string().min(1, { message: "ユーザーを選択してください" }),
	amount: z.number().int().min(0, { message: "0円以上を入力してください" }),
});

export const createLendingSchema = z.object({
	name: z.string().min(1, { message: "名前は必須です" }),
	amount: z.number().int().min(1, { message: "0円以下には設定できません" }),
	eventDate: z.date({ message: "日付は必須です" }),
	debts: z.array(debtSchema).min(1, { message: "最低1人の債務者が必要です" }),
});

export const updateLendingSchema = createLendingSchema.extend({
	id: z.string().nonempty(),
});

export type CreateLendingSchema = z.infer<typeof createLendingSchema>;
export type UpdateLendingSchema = z.infer<typeof updateLendingSchema>;
