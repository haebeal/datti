"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Lending, UpdateLendingRequest } from "../types";

export async function updateLending(
	data: UpdateLendingRequest,
): Promise<Result<Lending>> {
	try {
		const requestBody = {
			name: data.name,
			amount: data.amount,
			eventDate: data.eventDate.toISOString(),
			debts: data.debts,
		};

		const response = await apiClient.put<Lending>(
			`/lendings/${data.id}`,
			requestBody,
		);

		return {
			success: true,
			result: response,
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
