import { z } from "zod";
import {
  EventEndpoints_EventPostRequest,
  EventEndpoints_EventPutRequest,
} from "~/api/@types";
import { ToZod } from "~/lib/toZod";

export const eventCreateFormSchema = z.object<
  ToZod<EventEndpoints_EventPostRequest>
>({
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

export const eventUpdateFormSchema = z.object<
  ToZod<EventEndpoints_EventPutRequest>
>({
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
