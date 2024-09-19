import { z } from "zod";
import type {
	EventEndpoints_EventPostRequest,
	EventEndpoints_EventPutRequest,
} from "~/api/@types";
import type { ToZod } from "~/lib/toZod";

export const eventCreateFormSchema = z.object<
	ToZod<EventEndpoints_EventPostRequest>
>({
	name: z.string({
		required_error: "名前を入力してください",
	}),
	eventedAt: z.string().datetime(),
	paidBy: z.string(),
	amount: z.number(),
	payments: z.array(
		z.object({
			paidTo: z.string(),
			amount: z.number(),
		}),
	),
});

export const eventUpdateFormSchema = z.object<
	ToZod<EventEndpoints_EventPutRequest>
>({
	name: z.string({
		required_error: "名前を入力してください",
	}),
	eventedAt: z.string().datetime(),
	paidBy: z.string(),
	amount: z.number(),
	payments: z.array(
		z.object({
			paymentId: z.string().optional(),
			paidTo: z.string(),
			amount: z.number(),
		}),
	),
});

export const eventDeleteFormSchema = z.object({
	eventId: z.string(),
});
