"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Borrowing } from "../types";

export async function getAllBorrowings(): Promise<Result<Borrowing[]>> {
	try {
		const response = await apiClient.get<Borrowing[]>("/borrowings");
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
