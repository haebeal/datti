/**
 * Lending feature types
 */

export type Lending = {
  id: string;
  name: string;
  amount: number;
  eventDate: string;
  debts: Debt[];
  createdAt: string;
  updatedAt: string;
};

export type Debt = {
  userId: string;
  amount: number;
};

export type CreateLendingRequest = {
  name: string;
  amount: number;
  eventDate: Date;
  debts: Debt[];
};

export type UpdateLendingRequest = CreateLendingRequest & {
  id: string;
};

export type PaginatedLendingResponse = {
  lendings: Lending[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Discriminated union for lending items (includes borrowings)
 */
export type LendingItem =
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

export type PaginatedLendingItems = {
  items: LendingItem[];
  lendingsCursor: string | null;
  borrowingsCursor: string | null;
  lendingsHasMore: boolean;
  borrowingsHasMore: boolean;
};
