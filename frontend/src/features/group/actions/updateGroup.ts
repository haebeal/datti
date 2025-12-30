"use server";

import { apiClient } from "@/libs/api/client";
import { parseWithZod } from "@conform-to/zod";
import { updateGroupSchema } from "../schema";
import type { Group } from "../types";
import { revalidatePath } from "next/cache";

export async function updateGroup(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: updateGroupSchema,
  });
  if (submission.status !== "success") {
    return submission.reply();
  }

  const { id, name } = submission.value;

  try {
    await apiClient.put<Group>(`/groups/${id}`, {
      name,
    });
    revalidatePath(`/groups/${id}/settings`);
    revalidatePath("/groups");
    return submission.reply({ resetForm: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return submission.reply({
      formErrors: [message],
    });
  }
}
