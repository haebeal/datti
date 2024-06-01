import { z } from "zod";
import {
  EventCreateRequest,
  EventUpdateRequest,
  Payment,
} from "~/api/datti/@types";
import { ToZod } from "~/lib/toZod";

export const paymentFormSchema = z.object<ToZod<Payment>>({
  user: z.string(),
  amount: z.number(),
});

export const eventFormSchema = z.object<
  ToZod<EventCreateRequest | EventUpdateRequest>
>({
  name: z.string({
    required_error: "名前を入力してください",
  }),
  evented_at: z.string().datetime(),
  paid_by: z.string(),
  amount: z.number(),
  payments: paymentFormSchema.array(),
});
