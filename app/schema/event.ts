import { z } from "zod";
import { EventCreateRequest, EventUpdateRequest } from "~/api/datti/@types";
import { ToZod } from "~/lib/toZod";

export const eventSchema = z.object<
  ToZod<EventCreateRequest | EventUpdateRequest>
>({
  name: z.string(),
  evented_at: z.string().datetime(),
});
