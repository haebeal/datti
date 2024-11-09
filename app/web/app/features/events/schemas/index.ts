import { z } from "zod";
import type {
	EventEndpoints_EventPostRequest,
	EventEndpoints_EventPutRequest,
} from "~/api/@types";
import type { ToZod } from "~/lib/toZod";

export const createEventSchema = z.object<
	ToZod<EventEndpoints_EventPostRequest>
>({
	name: z.string({
		required_error: "必須項目です",
	}),
	eventedAt: z
		.string({
			required_error: "必須項目です",
		})
		.datetime(),
	paidBy: z.string({
		required_error: "必須項目です",
	}),
	amount: z.number({
		required_error: "必須項目です",
	}),
	payments: z.array(
		z.object({
			paidTo: z.string({
				required_error: "必須項目です",
			}),
			amount: z.number({
				required_error: "必須項目です",
			}),
		}),
	),
});

export const updateEventSchema = z.object<
	ToZod<EventEndpoints_EventPutRequest>
>({
	name: z.string({
		required_error: "必須項目です",
	}),
	eventedAt: z
		.string({
			required_error: "必須項目です",
		})
		.datetime(),
	paidBy: z.string({
		required_error: "必須項目です",
	}),
	amount: z.number({
		required_error: "必須項目です",
	}),
	payments: z.array(
		z.object({
			paymentId: z.string().optional(),
			paidTo: z.string({
				required_error: "必須項目です",
			}),
			amount: z.number({
				required_error: "必須項目です",
			}),
		}),
	),
});

export const deleteEventSchema = z.object({
	eventId: z.string(),
});
