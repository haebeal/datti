"use server";

import { parseWithZod } from "@conform-to/zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { createGroupSchema } from "../schema";

export async function createGroup(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createGroupSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { name } = submission.value;

  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data, error } = await client.POST("/groups", {
    body: { name },
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  // グループ一覧とレイアウトを再検証
  revalidatePath("/", "layout");
  revalidatePath("/groups");

  redirect(`/groups/${data.id}/lendings`);
}
