/**
 * Lending feature types
 */

export type Lending = {
	id: string;
	name: string;
	amount: number;
	eventDate: string;
	debts: Debt[];
	createdAt: string;
	updatedAt: string;
};

export type Debt = {
	userId: string;
	amount: number;
};

export type CreateLendingRequest = {
	name: string;
	amount: number;
	eventDate: Date;
	debts: Debt[];
};

export type UpdateLendingRequest = CreateLendingRequest & {
	id: string;
};
