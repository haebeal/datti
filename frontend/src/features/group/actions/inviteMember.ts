"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { revalidatePath } from "next/cache";

type InviteState = {
  error?: string;
  success?: boolean;
} | undefined;

export async function inviteMember(
  groupId: string,
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "メールアドレスを入力してください" };
  }

  const token = await getAuthToken();
  const client = createApiClient(token);

  // メールアドレスでユーザーを検索
  const { data: users, error: searchError } = await client.GET("/users", {
    params: { query: { email, limit: 1 } },
  });

  if (searchError || !users || users.length === 0) {
    return { error: "このメールアドレスのユーザーが見つかりませんでした" };
  }

  const userId = users[0].id;

  // メンバー追加
  const { error: addError } = await client.POST("/groups/{id}/members", {
    params: { path: { id: groupId } },
    body: { userId },
  });

  if (addError) {
    return { error: addError.message };
  }

  revalidatePath(`/groups/${groupId}/lendings`);
  return { success: true };
}
