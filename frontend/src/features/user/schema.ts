import { z } from "zod";

export const profileEditSchema = z.object({
	name: z.string().min(1, "名前を入力してください"),
	avatar: z.string(),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;
