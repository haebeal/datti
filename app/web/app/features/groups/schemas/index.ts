import { z } from "zod";
import type {
	GroupEndpoints_GroupPostRequest,
	GroupEndpoints_GroupPutRequest,
} from "~/api/@types";
import type { ToZod } from "~/lib/toZod";

export const createGroupSchema = z.object<
	ToZod<GroupEndpoints_GroupPostRequest>
>({
	name: z.string({
		required_error: "必須項目です",
	}),
	userIds: z.array(z.string()),
});

export const updateGroupSchema = z.object<
	ToZod<GroupEndpoints_GroupPutRequest>
>({
	name: z.string({
		required_error: "必須項目です",
	}),
});
