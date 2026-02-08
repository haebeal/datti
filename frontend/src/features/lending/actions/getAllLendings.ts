"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { getMe } from "@/features/user/actions/getMe";
import { formatDate } from "@/utils/format";
import type { Result } from "@/utils/types";
import type { Lending, LendingItem, PaginatedLendingItems } from "../types";

type GetAllLendingsParams = {
	limit?: number;
	cursor?: string;
};

function convertToLendingItems(lendings: Lending[], currentUserId: string): LendingItem[] {
	return lendings
		.map((lending) => {
			// createdBy が自分の場合は payer、そうでなければ debtor
			const isPayer = lending.createdBy === currentUserId;
			const totalDebtAmount = lending.debts.reduce((sum, debt) => sum + debt.amount, 0);

			let amount: number;
			if (isPayer) {
				// 支払者の場合は全員からの回収予定額
				amount = totalDebtAmount;
			} else {
				// 債務者の場合は自分の支払い額のみ
				const myDebt = lending.debts.find((debt) => debt.userId === currentUserId);
				amount = myDebt ? -myDebt.amount : 0;
			}

			return {
				id: lending.id,
				name: lending.name,
				amount,
				eventDate: formatDate(lending.eventDate),
				createdBy: lending.createdBy,
				debtsCount: lending.debts.length,
			};
		})
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

		// 現在のユーザーIDを取得
		const meResult = await getMe();
		if (!meResult.success) {
			return {
				success: false,
				result: null,
				error: meResult.error,
			};
		}
		const currentUserId = meResult.user.id;

		const response = await client.GET("/groups/{id}/lendings", {
          params: {
            path: { id: groupId },
            query: {
              limit: params?.limit,
              cursor: params?.cursor,
            },
          },
        });

		const items = convertToLendingItems(
			response.data?.lendings || [],
			currentUserId,
		);

		return {
			success: true,
			result: {
				items,
				nextCursor: response.data?.nextCursor ?? null,
				hasMore: response.data?.hasMore ?? false,
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
