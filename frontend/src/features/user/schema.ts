import { z } from "zod";

export const profileEditSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "名前を入力してください"),
  avatar: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;
