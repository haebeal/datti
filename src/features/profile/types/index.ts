import { z } from "zod";

export const profileScheme = z.object({
  email: z.string().email({
    message: "メールアドレスの形式が誤っています",
  }),
  name: z.string().min(1, {
    message: "ユーザー名を入力してください",
  }),
  picture: z
    .string()
    .url({
      message: "URLの形式が誤っています",
    })
    .optional(),
});

export type Profile = z.infer<typeof profileScheme>;
