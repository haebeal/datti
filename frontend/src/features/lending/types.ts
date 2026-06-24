export type Debt = {
	userId: string;
	amount: number;
};

export type Lending = {
	id: string;
	name: string;
	amount: number;
	eventDate: string;
	debts: Debt[];
	createdBy: string;
	createdAt: string;
	updatedAt: string;
};
