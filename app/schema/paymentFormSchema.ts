import { z } from "zod";
import { PaymentCreate, PaymentUpdate } from "~/api/@types";
import { ToZod } from "~/lib/toZod";

export const paymentCreateFormSchema = z.object<ToZod<PaymentCreate>>({
  paidTo: z.string(),
  paidAt: z.string().datetime(),
  amount: z.number(),
});

export const paymentUpdateFormSchema = z.object<ToZod<PaymentUpdate>>({
  paidTo: z.string(),
  paidAt: z.string().datetime(),
  paidBy: z.string().datetime(),
  amount: z.number(),
});
