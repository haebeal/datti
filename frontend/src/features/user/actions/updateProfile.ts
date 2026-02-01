"use server";

import { parseWithZod } from "@conform-to/zod";
import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { profileEditSchema } from "../schema";

export async function updateProfile(_prevState: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: profileEditSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { name, avatar } = submission.value;

  const token = await getAuthToken();
  const client = createApiClient(token);

  const { error } = await client.PUT("/users/me", {
    body: { name, avatar: avatar ?? "" },
  });

  if (error) {
    return submission.reply({
      formErrors: [error.message],
    });
  }

  // サイドバーのユーザー情報を更新
  revalidatePath("/", "layout");
  redirect("/profile");
}
