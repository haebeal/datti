"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Credit } from "../types";

export async function getAllCredits(): Promise<Result<Credit[]>> {
	try {
		const response = await apiClient.get<Credit[]>("/credits");
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
