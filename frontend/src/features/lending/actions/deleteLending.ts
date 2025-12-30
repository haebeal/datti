"use server";

import { redirect } from "next/navigation";
import { apiClient } from "@/libs/api/client";

export type DeleteLendingState =
  | {
      error: string;
    }
  | undefined;

export async function deleteLending(
  groupId: string,
  lendingId: string,
  _: DeleteLendingState,
  _formData: FormData,
): Promise<DeleteLendingState> {
  try {
    await apiClient.delete(`/groups/${groupId}/lendings/${lendingId}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  redirect(`/groups/${groupId}/lendings`);
}
