import { z } from "zod";
import { GroupCreateRequest } from "~/api/datti/@types";
import { ToZod } from "~/lib/toZod";

export const groupSchema = z.object<ToZod<GroupCreateRequest>>({
  name: z.string(),
  uids: z.array(z.string()),
});
