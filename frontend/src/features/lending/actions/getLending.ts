"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Lending } from "../types";

export async function getLending(
	groupId: string,
	id: string,
): Promise<Result<Lending>> {
	try {
		const response = await apiClient.get<Lending>(
			`/groups/${groupId}/lendings/${id}`,
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
