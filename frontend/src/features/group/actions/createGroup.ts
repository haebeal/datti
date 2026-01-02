"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiClient } from "@/libs/api/client";
import { createGroupSchema } from "../schema";
import type { Group } from "../types";

export async function createGroup(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createGroupSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { name } = submission.value;

  let response: Group;

  try {
    response = await apiClient.post<Group>("/groups", { name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return submission.reply({
      formErrors: [message],
    });
  }

  // グループ一覧とレイアウトを再検証
  revalidatePath("/", "layout");
  revalidatePath("/groups");

  // redirect は try ブロックの外で呼ぶ
  redirect(`/groups/${response.id}/lendings`);
}
