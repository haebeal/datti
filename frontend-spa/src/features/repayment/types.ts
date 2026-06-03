import type { User } from "@/features/user/types";

export type Repayment = {
	id: string;
	payer: User;
	debtor: User;
	amount: number;
	createdAt: string;
	updatedAt: string;
};
