"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { getMe } from "@/features/user/actions/getMe";

type SearchResult = {
  success: true;
  user: { id: string; name: string; email: string };
} | {
  success: false;
  error: string;
};

export async function searchUserByEmail(email: string): Promise<SearchResult> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { data: users, error } = await client.GET("/users", {
    params: { query: { email, limit: 1 } },
  });

  if (error || !users || users.length === 0) {
    return { success: false, error: "このメールアドレスのユーザーが見つかりませんでした" };
  }

  const meResult = await getMe();
  if (meResult.success && meResult.user.id === users[0].id) {
    return { success: false, error: "自分自身を招待することはできません" };
  }

  return { success: true, user: { id: users[0].id, name: users[0].name, email: users[0].email } };
}
