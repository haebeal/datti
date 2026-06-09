import { z } from "zod";

export const groupNameSchema = z
	.string()
	.min(1, "グループ名を入力してください");

export const createGroupSchema = z.object({
	name: groupNameSchema,
});

export const updateGroupSchema = z.object({
	name: groupNameSchema,
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
