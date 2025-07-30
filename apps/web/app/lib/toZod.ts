import type { z } from "zod";

export type ToZod<T extends Record<string, unknown>> = {
	[K in keyof T]-?: z.ZodType<T[K]>;
};
