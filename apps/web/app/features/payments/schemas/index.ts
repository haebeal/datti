import { z } from "zod";
import type { PaymentCreate, PaymentUpdate } from "~/api/@types";
import type { ToZod } from "~/lib/toZod";

export const createPaymentSchema = z.object<ToZod<PaymentCreate>>({
	paidTo: z.string({
		required_error: "必須項目です",
	}),
	paidAt: z
		.string({
			required_error: "必須項目です",
		})
		.datetime(),
	amount: z.number({
		required_error: "必須項目です",
	}),
});

export const updatePaymentSchema = z.object<ToZod<PaymentUpdate>>({
	paidTo: z.string({
		required_error: "必須項目です",
	}),
	paidAt: z
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
});
