"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { CreateLendingRequest, Lending } from "../types";

export async function createLending(
	data: CreateLendingRequest,
): Promise<Result<Lending>> {
	try {
		const requestBody = {
			name: data.name,
			amount: data.amount,
			eventDate: data.eventDate.toISOString(),
			debts: data.debts,
		};

		const response = await apiClient.post<Lending>("/lendings", requestBody);

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
