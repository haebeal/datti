"use server";

import { redirect } from "next/navigation";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";

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
  const token = await getAuthToken();
  const client = createApiClient(token);

  const { error } = await client.DELETE("/groups/{id}/lendings/{lendingId}", {
    params: { path: { id: groupId, lendingId } },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/groups/${groupId}/lendings`);
}
