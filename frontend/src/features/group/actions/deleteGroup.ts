"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";

export type DeleteGroupState =
  | {
      error: string;
    }
  | undefined;

export async function deleteGroup(
  groupId: string,
  _: DeleteGroupState,
  _formData: FormData,
): Promise<DeleteGroupState> {
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { error } = await client.DELETE("/groups/{id}", {
    params: { path: { id: groupId } },
  });

  if (error) {
    return { error: error.message };
  }

  // グループ一覧とレイアウトを再検証
  revalidatePath("/", "layout");
  revalidatePath("/groups");
  redirect("/groups");
}
