import type { z } from "zod";

export type ToZod<T extends Record<string, any>> = {
  [K in keyof T]-?: z.ZodType<T[K]>;
};
