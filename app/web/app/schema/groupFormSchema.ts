import { z } from "zod";
import type {
	GroupEndpoints_GroupPostRequest,
	GroupEndpoints_GroupPutRequest,
} from "~/api/@types";
import type { ToZod } from "~/lib/toZod";

export const groupFormSchema = z.object<
	ToZod<GroupEndpoints_GroupPostRequest | GroupEndpoints_GroupPutRequest>
>({
	name: z.string(),
	userIds: z.array(z.string()),
});
