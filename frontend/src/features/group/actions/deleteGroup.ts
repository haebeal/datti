"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiClient } from "@/libs/api/client";

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
  try {
    await apiClient.delete(`/groups/${groupId}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // グループ一覧とレイアウトを再検証
  revalidatePath("/", "layout");
  revalidatePath("/groups");
  redirect("/groups");
}
