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

  // メールアドレスリストを取得
  const emails = formData.getAll("emails") as string[];
  const validEmails = emails.filter((e) => e.trim() !== "");

  const token = await getAuthToken();
  const client = createApiClient(token);

  // グループ作成
  const { data, error } = await client.POST("/groups", {
    body: { name },
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  // メンバー招待（メールアドレスからユーザー検索して追加）
  const inviteErrors: string[] = [];
  for (const email of validEmails) {
    const { data: users } = await client.GET("/users", {
      params: { query: { email, limit: 1 } },
    });

    if (!users || users.length === 0) {
      inviteErrors.push(`${email}: ユーザーが見つかりません`);
      continue;
    }

    const { error: addError } = await client.POST("/groups/{id}/members", {
      params: { path: { id: data.id } },
      body: { userId: users[0].id },
    });

    if (addError) {
      inviteErrors.push(`${email}: ${addError.message}`);
    }
  }

  // グループ一覧とレイアウトを再検証
  revalidatePath("/", "layout");
  revalidatePath("/groups");

  redirect(`/groups/${data.id}/lendings`);
}
