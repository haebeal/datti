import { z } from "zod";

import type { Profile } from "@/api/datti/@types";

import type { ToZod } from "@/utils";

export const profileSchema = z.object<
  Pick<ToZod<Profile>, "name" | "photoUrl">
>({
  name: z.string(),
  photoUrl: z.string().url(),
});
