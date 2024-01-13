import { z } from "zod";

export const bankAccountScheme = z.object({
  accountCode: z.string().length(7, {
    message: "口座番号は7桁で入力してください",
  }),
  bankCode: z.string().min(3).max(4),
  branchCode: z.string().length(3),
});

export type BankAccount = z.infer<typeof bankAccountScheme>;
