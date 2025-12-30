"use server";

import { apiClient } from "@/libs/api/client";
import { parseWithZod } from "@conform-to/zod";
import { addMemberSchema } from "../schema";
import { revalidatePath } from "next/cache";

export async function addMember(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: addMemberSchema,
  });
  if (submission.status !== "success") {
    return submission.reply();
  }

  const { groupId, userId } = submission.value;

  try {
    await apiClient.post(`/groups/${groupId}/members`, { userId });
    revalidatePath(`/groups/${groupId}/settings`);
    return submission.reply({ resetForm: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return submission.reply({
      formErrors: [message],
    });
  }
}
