import { z } from "zod";
import {
  GroupEndpoints_GroupPostRequest,
  GroupEndpoints_GroupPutRequest,
} from "~/api/@types";
import { ToZod } from "~/lib/toZod";

export const groupFormSchema = z.object<
  ToZod<GroupEndpoints_GroupPostRequest | GroupEndpoints_GroupPutRequest>
>({
  name: z.string(),
  uids: z.array(z.string()),
});
