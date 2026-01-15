"use server";

import { getAuthToken } from "@/libs/auth/getAuthToken";
import { createApiClient } from "@/libs/api/client";
import { formatDate } from "@/utils/format";
import type { Result } from "@/utils/types";
import type { Lending, LendingItem, PaginatedLendingItems } from "../types";
import type { Borrowing } from "@/features/borrowing/types";

type GetAllLendingsParams = {
  limit?: number;
  lendingsCursor?: string;
  borrowingsCursor?: string;
  lendingsHasMore?: boolean;
  borrowingsHasMore?: boolean;
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
  const client = createApiClient(token);

  // Default hasMore to true for initial fetch
  const shouldFetchLendings = params?.lendingsHasMore !== false;
  const shouldFetchBorrowings = params?.borrowingsHasMore !== false;

  // Only fetch APIs that still have more data
  const [lendingsResult, borrowingsResult] = await Promise.all([
    shouldFetchLendings
      ? client.GET("/groups/{id}/lendings", {
          params: {
            path: { id: groupId },
            query: {
              limit: params?.limit,
              cursor: params?.lendingsCursor,
            },
          },
        })
      : null,
    shouldFetchBorrowings
      ? client.GET("/groups/{id}/borrowings", {
          params: {
            path: { id: groupId },
            query: {
              limit: params?.limit,
              cursor: params?.borrowingsCursor,
            },
          },
        })
      : null,
  ]);

  if (lendingsResult?.error || borrowingsResult?.error) {
    return {
      success: false,
      result: null,
      error:
        lendingsResult?.error?.message ||
        borrowingsResult?.error?.message ||
        "Unknown error",
    };
  }

  const items = convertToLendingItems(
    lendingsResult?.data?.lendings ?? [],
    borrowingsResult?.data?.borrowings ?? [],
  );

  return {
    success: true,
    result: {
      items,
      lendingsCursor: lendingsResult?.data?.nextCursor ?? null,
      borrowingsCursor: borrowingsResult?.data?.nextCursor ?? null,
      lendingsHasMore: lendingsResult?.data?.hasMore ?? false,
      borrowingsHasMore: borrowingsResult?.data?.hasMore ?? false,
    },
    error: null,
  };
}
