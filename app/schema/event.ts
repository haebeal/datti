import { z } from "zod";
import {
  EventCreateRequest,
  EventUpdateRequest,
  Payment,
} from "~/api/datti/@types";
import { ToZod } from "~/lib/toZod";

export const paymentSchema = z.object<ToZod<Payment>>({
  user: z.string(),
  amount: z.number(),
});

export const eventSchema = z.object<
  ToZod<EventCreateRequest | EventUpdateRequest>
>({
  name: z.string({
    required_error: "名前を入力してください",
  }),
  evented_at: z.string().datetime(),
  paid_by: z.string(),
  amount: z.number(),
  payments: paymentSchema.array(),
});
