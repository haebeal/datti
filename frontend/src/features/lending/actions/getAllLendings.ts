"use server";

import { apiClient } from "@/libs/api/client";
import { formatDate, type Result } from "@/schema";
import type {
	Lending,
	LendingItem,
	PaginatedLendingItems,
	PaginatedLendingResponse,
} from "../types";

type GetAllLendingsParams = {
	limit?: number;
	cursor?: string;
};

function convertToLendingItems(lendings: Lending[]): LendingItem[] {
	return lendings
		.map((lending) => ({
			id: lending.id,
			name: lending.name,
			// payer の場合は debts の合計、debtor の場合は負の金額
			amount:
				lending.role === "payer"
					? lending.debts.reduce((sum, debt) => sum + debt.amount, 0)
					: -lending.debts.reduce((sum, debt) => sum + debt.amount, 0),
			eventDate: formatDate(lending.eventDate),
			role: lending.role,
			payerId: lending.payerId,
			debtsCount: lending.debts.length,
		}))
		.sort(
			(a, b) =>
				new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
		);
}

export async function getAllLendings(
	groupId: string,
	params?: GetAllLendingsParams,
): Promise<Result<PaginatedLendingItems>> {
	try {
		const searchParams = new URLSearchParams();

		if (params?.limit) {
			searchParams.set("limit", params.limit.toString());
		}
		if (params?.cursor) {
			searchParams.set("cursor", params.cursor);
		}

		const query = searchParams.toString();
		const url = query
			? `/groups/${groupId}/lendings?${query}`
			: `/groups/${groupId}/lendings`;

		const response = await apiClient.get<PaginatedLendingResponse>(url);

		const items = convertToLendingItems(response.lendings);

		return {
			success: true,
			result: {
				items,
				nextCursor: response.nextCursor,
				hasMore: response.hasMore,
			},
			error: null,
		};
	} catch (error) {
		return {
			success: false,
			result: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
