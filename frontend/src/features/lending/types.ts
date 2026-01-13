/**
 * Lending feature types
 */

export type LendingRole = "payer" | "debtor";

export type Lending = {
	id: string;
	name: string;
	amount: number;
	eventDate: string;
	debts: Debt[];
	role: LendingRole;
	payerId: string;
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

export type PaginatedLendingResponse = {
	lendings: Lending[];
	nextCursor: string | null;
	hasMore: boolean;
};

/**
 * Lending item for list display
 */
export type LendingItem = {
	id: string;
	name: string;
	amount: number;
	eventDate: string;
	role: LendingRole;
	payerId: string;
	debtsCount: number;
};

export type PaginatedLendingItems = {
	items: LendingItem[];
	nextCursor: string | null;
	hasMore: boolean;
};
