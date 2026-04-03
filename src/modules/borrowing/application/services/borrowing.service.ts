import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BORROWING_REPOSITORY } from '../../domain/ports/borrowing.port';
import type { IBorrowingRepository } from '../../domain/ports/borrowing.port';
import { CheckoutDto } from '../dto/checkout.dto';
import { ReturnBookDto } from '../dto/returnBook.dto';
import { BOOK_REPOSITORY } from '../../../books/domain/ports/book.port';
import type { IBookRepository } from '../../../books/domain/ports/book.port';
import { BORROWER_REPOSITORY } from '../../../borrowers/domain/ports/borrower.port';
import type { IBorrowerRepository } from '../../../borrowers/domain/ports/borrower.port';

@Injectable()
export class BorrowingService {
  constructor(
    @Inject(BORROWING_REPOSITORY)
    private readonly borrowingRepository: IBorrowingRepository,

    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,

    @Inject(BORROWER_REPOSITORY)
    private readonly borrowerRepository: IBorrowerRepository,
  ) {}

  async checkout(checkoutDto: CheckoutDto) {
    // Validate borrower exists
    const borrower = await this.borrowerRepository.findById(
      checkoutDto.borrowerId,
    );
    if (!borrower) {
      throw new NotFoundException('Borrower not found.');
    }

    // Validate book exists and has available copies
    const book = await this.bookRepository.findById(checkoutDto.bookId);
    if (!book) {
      throw new NotFoundException('Book not found.');
    }
    if (book.availableQuantity <= 0) {
      throw new BadRequestException(
        'No available copies of this book currently.',
      );
    }

    // Check borrower doesn't already have this book checked out
    const existingBorrow = await this.borrowingRepository.findActiveBorrow({
      borrowerId: checkoutDto.borrowerId,
      bookId: checkoutDto.bookId,
    });
    if (existingBorrow) {
      throw new BadRequestException(
        'This borrower already has this book checked out.',
      );
    }

    const dueDate = new Date(checkoutDto.dueDate);
    if (dueDate <= new Date()) {
      throw new BadRequestException('Due date must be in the future.');
    }

    return this.borrowingRepository.checkout({
      borrowerId: checkoutDto.borrowerId,
      bookId: checkoutDto.bookId,
      dueDate,
    });
  }

  async returnBook(returnBookDto: ReturnBookDto) {
    // Validate borrower exists
    const borrower = await this.borrowerRepository.findById(
      returnBookDto.borrowerId,
    );
    if (!borrower) {
      throw new NotFoundException('Borrower not found.');
    }

    // Validate book exists
    const book = await this.bookRepository.findById(returnBookDto.bookId);
    if (!book) {
      throw new NotFoundException('Book not found.');
    }

    // Find the active borrow record
    const activeBorrow = await this.borrowingRepository.findActiveBorrow({
      borrowerId: returnBookDto.borrowerId,
      bookId: returnBookDto.bookId,
    });
    if (!activeBorrow) {
      throw new BadRequestException(
        'No active borrow record found for this borrower and book.',
      );
    }

    return this.borrowingRepository.returnBook({
      borrowerId: returnBookDto.borrowerId,
      bookId: returnBookDto.bookId,
    });
  }

  async getBorrowerBooks(borrowerId: string) {
    const borrower = await this.borrowerRepository.findById(borrowerId);
    if (!borrower) {
      throw new NotFoundException('Borrower not found.');
    }

    return this.borrowingRepository.findActiveBorrowsByBorrower(borrowerId);
  }

  async getOverdue() {
    return this.borrowingRepository.findOverdue();
  }
}
