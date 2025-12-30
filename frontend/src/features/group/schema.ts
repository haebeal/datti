import z from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1, "グループ名を入力してください"),
});

export const updateGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "グループ名を入力してください"),
});

export const addMemberSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
});
