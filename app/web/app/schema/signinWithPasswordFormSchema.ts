import { z } from "zod";

export const signinWithPasswordFormSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});
