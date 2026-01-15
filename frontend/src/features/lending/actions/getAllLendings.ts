"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { apiClient } from "@/libs/api/client";
import { formatDate, type Result } from "@/schema";
import type {
	Lending,
	LendingItem,
	PaginatedLendingItems,
	PaginatedLendingResponse,
} from "../types";
import type {
	Borrowing,
	PaginatedBorrowingResponse,
} from "@/features/borrowing/types";

type GetAllLendingsParams = {
	limit?: number;
	lendingsCursor?: string;
	borrowingsCursor?: string;
};

type RawLendingItem =
	| {
			type: "lending";
			id: string;
			name: string;
			amount: number;
			eventDate: string;
			debtsCount: number;
	  }
	| {
			type: "borrowing";
			id: string;
			name: string;
			amount: number;
			eventDate: string;
	  };

function convertToLendingItems(
	lendings: Lending[],
	borrowings: Borrowing[],
): LendingItem[] {
	const lendingItems: RawLendingItem[] = lendings.map((lending) => ({
		type: "lending" as const,
		id: lending.id,
		name: lending.name,
		amount: lending.debts.reduce((sum, debt) => sum + debt.amount, 0),
		eventDate: lending.eventDate,
		debtsCount: lending.debts.length,
	}));

	const borrowingItems: RawLendingItem[] = borrowings.map((borrowing) => ({
		type: "borrowing" as const,
		id: borrowing.id,
		name: borrowing.name,
		amount: -borrowing.amount,
		eventDate: borrowing.eventDate,
	}));

	// Sort first, then format eventDate
	return [...lendingItems, ...borrowingItems]
		.sort(
			(a, b) =>
				new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
		)
		.map((item) => ({
			...item,
			eventDate: formatDate(item.eventDate),
		}));
}

export async function getAllLendings(
	groupId: string,
	params?: GetAllLendingsParams,
): Promise<Result<PaginatedLendingItems>> {
	const token = await getAuthToken();

	try {
		// Build query strings
		const lendingsSearchParams = new URLSearchParams();
		const borrowingsSearchParams = new URLSearchParams();

		if (params?.limit) {
			lendingsSearchParams.set("limit", params.limit.toString());
			borrowingsSearchParams.set("limit", params.limit.toString());
		}
		if (params?.lendingsCursor) {
			lendingsSearchParams.set("cursor", params.lendingsCursor);
		}
		if (params?.borrowingsCursor) {
			borrowingsSearchParams.set("cursor", params.borrowingsCursor);
		}

		const lendingsQuery = lendingsSearchParams.toString();
		const borrowingsQuery = borrowingsSearchParams.toString();

		const lendingsUrl = lendingsQuery
			? `/groups/${groupId}/lendings?${lendingsQuery}`
			: `/groups/${groupId}/lendings`;
		const borrowingsUrl = borrowingsQuery
			? `/groups/${groupId}/borrowings?${borrowingsQuery}`
			: `/groups/${groupId}/borrowings`;

		// Fetch both in parallel
		const [lendingsResponse, borrowingsResponse] = await Promise.all([
			apiClient.get<PaginatedLendingResponse>(lendingsUrl, token),
			apiClient.get<PaginatedBorrowingResponse>(borrowingsUrl, token),
		]);

		const items = convertToLendingItems(
			lendingsResponse.lendings,
			borrowingsResponse.borrowings,
		);

		return {
			success: true,
			result: {
				items,
				lendingsCursor: lendingsResponse.nextCursor,
				borrowingsCursor: borrowingsResponse.nextCursor,
				hasMore: lendingsResponse.hasMore || borrowingsResponse.hasMore,
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
