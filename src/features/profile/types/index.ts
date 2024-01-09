import { z } from "zod";

export const profileScheme = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  photoUrl: z.string().url(),
  accountCode: z.string().length(7, {
    message: "口座番号は7桁で入力してください",
  }),
  bankCode: z.string().min(3).max(4),
  branchCode: z.string().length(3),
});

export type Profile = z.infer<typeof profileScheme>;
