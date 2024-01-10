import { z } from "zod";

export const profileScheme = z.object({
  id: z.string().readonly(),
  name: z.string().min(1, {
    message: "ユーザー名を入力してください",
  }),
  email: z.string().email({
    message: "メールアドレスの形式が誤っています",
  }),
  photoUrl: z
    .string()
    .url({
      message: "URLの形式が誤っています",
    })
    .optional(),
  accountCode: z.string().length(7, {
    message: "口座番号は7桁で入力してください",
  }),
  bankCode: z.string().min(3).max(4),
  branchCode: z.string().length(3),
});

export type Profile = z.infer<typeof profileScheme>;
