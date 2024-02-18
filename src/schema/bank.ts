import { z } from "zod";

import type { Bank } from "@/api/datti/@types";

import type { ToZod } from "@/utils";

export const bankAccountSchema = z.object<
  Pick<ToZod<Bank>, "accountCode" | "bankCode" | "branchCode">
>({
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
