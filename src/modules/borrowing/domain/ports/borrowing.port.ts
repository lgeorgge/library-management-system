export const BORROWING_REPOSITORY = Symbol('BORROWING_REPOSITORY');

export type BorrowingScopeType = 'all' | 'overdue';

export type BorrowingReportRecord = {
  id: string;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  book: {
    title: string;
    isbn: string;
  };
  borrower: {
    name: string;
    email: string;
  };
};

export interface IBorrowingRepository {
  checkout(data: {
    borrowerId: string;
    bookId: string;
    dueDate: Date;
  }): Promise<{ id: string }>;

  returnBook(data: {
    borrowerId: string;
    bookId: string;
  }): Promise<{ id: string }>;

  // Active (not yet returned) borrows for a specific borrower
  findActiveBorrowsByBorrower(borrowerId: string): Promise<
    {
      id: string;
      borrowedAt: Date;
      dueDate: Date;
      book: {
        id: string;
        title: string;
        author: string;
        isbn: string;
      };
    }[]
  >;

  // All records where dueDate has passed and book not yet returned
  findOverdue(): Promise<
    {
      id: string;
      borrowedAt: Date;
      dueDate: Date;
      borrower: {
        id: string;
        name: string;
        email: string;
      };
      book: {
        id: string;
        title: string;
        author: string;
        isbn: string;
      };
    }[]
  >;

  // Find an unreturned borrow record for a specific borrower+book pair
  findActiveBorrow(data: {
    borrowerId: string;
    bookId: string;
  }): Promise<{ id: string } | null>;

  findBorrowings(
    from: Date,
    to: Date,
    scope: BorrowingScopeType,
  ): Promise<BorrowingReportRecord[]>;
}
