import { z } from "zod";
import { EventCreateRequest, EventUpdateRequest } from "~/api/@types";
import { ToZod } from "~/lib/toZod";

export const eventCreateFormSchema = z.object<ToZod<EventCreateRequest>>({
  name: z.string({
    required_error: "名前を入力してください",
  }),
  evented_at: z.string().datetime(),
  paid_by: z.string(),
  amount: z.number(),
  payments: z.array(
    z.object({
      paid_to: z.string(),
      amount: z.number(),
    })
  ),
});

export const eventUpdateFormSchema = z.object<ToZod<EventUpdateRequest>>({
  name: z.string({
    required_error: "名前を入力してください",
  }),
  evented_at: z.string().datetime(),
  paid_by: z.string(),
  amount: z.number(),
  payments: z.array(
    z.object({
      payment_id: z.string(),
      paid_to: z.string(),
      amount: z.number(),
    })
  ),
});
