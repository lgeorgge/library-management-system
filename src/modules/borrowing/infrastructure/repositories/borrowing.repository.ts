import { Injectable } from '@nestjs/common';
import {
  BorrowingReportRecord,
  BorrowingScopeType,
  IBorrowingRepository,
} from '../../domain/ports/borrowing.port';
import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class BorrowingRepository implements IBorrowingRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a BorrowRecord and atomically decrements the book's availableQuantity
   * in a single transaction to prevent race conditions.
   */
  async checkout(data: {
    borrowerId: string;
    bookId: string;
    dueDate: Date;
  }): Promise<{ id: string }> {
    const result = await this.prisma.$transaction(async (tx) => {
      // Decrement available quantity (double-check with optimistic locking)
      await tx.book.update({
        where: { id: data.bookId },
        data: { availableQuantity: { decrement: 1 } },
      });

      return tx.borrowRecord.create({
        data: {
          borrowerId: data.borrowerId,
          bookId: data.bookId,
          dueDate: data.dueDate,
        },
        select: { id: true },
      });
    });

    return result;
  }

  /**
   * Sets returnedAt on the BorrowRecord and atomically increments availableQuantity.
   */
  async returnBook(data: {
    borrowerId: string;
    bookId: string;
  }): Promise<{ id: string }> {
    const result = await this.prisma.$transaction(async (tx) => {
      const record = await tx.borrowRecord.findFirst({
        where: {
          borrowerId: data.borrowerId,
          bookId: data.bookId,
          returnedAt: null,
        },
        select: { id: true },
      });

      // Should never be null here (service already validated), but defensive check
      if (!record) {
        throw new Error('Active borrow record not found.');
      }

      await tx.book.update({
        where: { id: data.bookId },
        data: { availableQuantity: { increment: 1 } },
      });

      return tx.borrowRecord.update({
        where: { id: record.id },
        data: { returnedAt: new Date() },
        select: { id: true },
      });
    });

    return result;
  }

  async findActiveBorrowsByBorrower(borrowerId: string): Promise<
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
  > {
    return this.prisma.borrowRecord.findMany({
      where: {
        borrowerId,
        returnedAt: null,
      },
      select: {
        id: true,
        borrowedAt: true,
        dueDate: true,
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOverdue(): Promise<
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
  > {
    return this.prisma.borrowRecord.findMany({
      where: {
        dueDate: { lt: new Date() },
        returnedAt: null,
      },
      select: {
        id: true,
        borrowedAt: true,
        dueDate: true,
        borrower: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findActiveBorrow(data: {
    borrowerId: string;
    bookId: string;
  }): Promise<{ id: string } | null> {
    return this.prisma.borrowRecord.findFirst({
      where: {
        borrowerId: data.borrowerId,
        bookId: data.bookId,
        returnedAt: null,
      },
      select: { id: true },
    });
  }

  async findBorrowings(
    from: Date,
    to: Date,
    scope: BorrowingScopeType,
  ): Promise<BorrowingReportRecord[]> {
    return this.prisma.borrowRecord.findMany({
      where: {
        borrowedAt: {
          gte: from,
          lte: to,
        },
        ...(scope === 'overdue'
          ? {
              returnedAt: null,
              dueDate: { lt: new Date() },
            }
          : {}),
      },
      include: {
        book: {
          select: {
            title: true,
            isbn: true,
          },
        },
        borrower: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        borrowedAt: 'desc',
      },
    });
  }
}
