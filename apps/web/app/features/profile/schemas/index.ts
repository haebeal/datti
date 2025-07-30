import { z } from "zod";
import type { UserEndpoints_UserPutRequest } from "~/api/@types";

import type { ToZod } from "~/lib/toZod";

export const updateProfileSchema = z.object<
	ToZod<UserEndpoints_UserPutRequest>
>({
	name: z.string({
		required_error: "必須項目です",
	}),
	photoUrl: z
		.string({
			required_error: "必須項目です",
		})
		.url("URLの形式が正しくありません"),
});
