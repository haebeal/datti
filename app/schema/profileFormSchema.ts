import { z } from "zod";
import { UserEndpoints_UserPutRequest } from "~/api/@types";

import { ToZod } from "~/lib/toZod";

export const profileFormSchema = z.object<ToZod<UserEndpoints_UserPutRequest>>({
  name: z.string().min(1, {
    message: "ユーザー名を入力してください",
  }),
  photoUrl: z.string().url(),
});
