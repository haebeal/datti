import { z } from "zod";

import type { User } from "~/api/datti/@types";

import { ToZod } from "~/lib/toZod";

export const userSchema = z.object<ToZod<User>>({
  uid: z.string(),
  email: z.string().email(),
  name: z.string().min(1, {
    message: "ユーザー名を入力してください",
  }),
  photoUrl: z.string().url(),
});
