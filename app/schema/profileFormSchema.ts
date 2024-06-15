import { z } from "zod";

import type { UserUpdateRequest } from "~/api/@types";

import { ToZod } from "~/lib/toZod";

export const profileFormSchema = z.object<ToZod<UserUpdateRequest>>({
  name: z.string().min(1, {
    message: "ユーザー名を入力してください",
  }),
  photoUrl: z.string().url(),
});
