/**
 * Borrowing feature types
 */

export type Borrowing = {
  id: string;
  name: string;
  amount: number;
  eventDate: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedBorrowingResponse = {
  borrowings: Borrowing[];
  nextCursor: string | null;
  hasMore: boolean;
};
