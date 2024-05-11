import { z } from "zod";

import type { Bank, UserUpdateRequest } from "~/api/datti/@types";

import { ToZod } from "~/lib/toZod";

const bankFormSchema = z.object<ToZod<Bank>>({
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

export const profileFormSchema = z.object<ToZod<UserUpdateRequest>>({
  name: z.string().min(1, {
    message: "ユーザー名を入力してください",
  }),
  photoUrl: z.string().url(),
  bank: bankFormSchema,
});
