import type { User } from "@/features/user/types";

export type Credit = {
	user: User;
	amount: number;
};
