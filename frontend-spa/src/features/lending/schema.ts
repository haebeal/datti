import { z } from "zod";

const debtSchema = z.object({
	userId: z.string().min(1, "ユーザーを選択してください"),
	amount: z.number().min(1, "金額は1以上である必要があります"),
});

export const lendingFormSchema = z.object({
	name: z.string().min(1, "名前を入力してください"),
	amount: z.number().min(1, "金額は1以上である必要があります"),
	eventDate: z.string().min(1, "日付を選択してください"),
	debts: z.array(debtSchema).min(1, "少なくとも1人の債務者が必要です"),
});

export type LendingFormInput = z.infer<typeof lendingFormSchema>;
