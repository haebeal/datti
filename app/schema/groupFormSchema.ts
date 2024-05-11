import { z } from "zod";
import { GroupCreateRequest, GroupUpdateRequest } from "~/api/datti/@types";
import { ToZod } from "~/lib/toZod";

export const groupFormSchema = z.object<
  ToZod<GroupCreateRequest | GroupUpdateRequest>
>({
  name: z.string(),
  uids: z.array(z.string()),
});
