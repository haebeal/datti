import { z } from "zod";

export const bankAccountScheme = z.object({
  accountCode: z.string().length(7, {
    message: "口座番号は7桁で入力してください",
  }),
  bankCode: z
    .string()
    .min(3, {
      message: "金融機関を選択してください",
    })
    .max(4, {
      message: "金融機関を選択してください",
    }),
  branchCode: z.string().length(3, {
    message: "支店を選択してください",
  }),
});

export type BankAccount = z.infer<typeof bankAccountScheme>;
