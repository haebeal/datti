import { z } from "zod";
import { GroupCreateRequest, GroupUpdateRequest } from "~/api/@types";
import { ToZod } from "~/lib/toZod";

export const groupFormSchema = z.object<
  ToZod<GroupCreateRequest | GroupUpdateRequest>
>({
  name: z.string(),
  uids: z.array(z.string()),
});
