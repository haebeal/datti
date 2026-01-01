"use server";

import { parseWithZod } from "@conform-to/zod";
import { apiClient } from "@/libs/api/client";
import { revalidatePath } from "next/cache";
import { profileEditSchema } from "../schema";
import type { User } from "../types";

export async function updateProfile(
  _prevState: unknown,
  formData: FormData
) {
  const submission = parseWithZod(formData, {
    schema: profileEditSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { id, name, avatar } = submission.value;

  try {
    await apiClient.put<User>(`/users/${id}`, {
      name,
      avatar,
    });

    // サイドバーのユーザー情報を更新
    revalidatePath("/", "layout");

    return submission.reply({
      formErrors: [],
      fieldErrors: {},
    });
  } catch (error) {
    return submission.reply({
      formErrors: [
        error instanceof Error ? error.message : "更新に失敗しました",
      ],
    });
  }
}
