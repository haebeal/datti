import { z } from "zod";

export const profileSchema = z.object({
  displayName: z.string().min(1, {
    message: "ユーザー名を入力してください",
  }),
  photoURL: z.string().url({
    message: "URLの形式が誤っています",
  }),
});

export type Profile = z.infer<typeof profileSchema>;
