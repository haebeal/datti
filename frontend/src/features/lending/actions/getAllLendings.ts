"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Lending, PaginatedLendingResponse } from "../types";

type GetAllLendingsParams = {
	limit?: number;
	cursor?: string;
};

type PaginatedLendings = {
	lendings: Lending[];
	nextCursor: string | null;
	hasMore: boolean;
};

export async function getAllLendings(
	groupId: string,
	params?: GetAllLendingsParams,
): Promise<Result<PaginatedLendings>> {
	try {
		// Build query string
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

		return {
			success: true,
			result: {
				lendings: response.lendings,
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
