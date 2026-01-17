"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { formatDate } from "@/utils/format";
import type { Result } from "@/utils/types";
import type { Lending, LendingItem, PaginatedLendingItems } from "../types";
import type { Borrowing } from "@/features/borrowing/types";

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
    const token = await getAuthToken();
    const client = createApiClient(token);

		const response = await client.GET("/groups/{id}/lendings", {
          params: {
            path: { id: groupId },
            query: {
              limit: params?.limit,
              cursor: params?.cursor,
            },
          },
        })
;

		const items = convertToLendingItems(
			response.lendings,
		);

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
