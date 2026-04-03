import { Module } from '@nestjs/common';
import { BorrowingController } from './borrowing.controller';
import { BorrowingService } from '../application/services/borrowing.service';
import { BorrowingRepository } from '../infrastructure/repositories/borrowing.repository';
import { BORROWING_REPOSITORY } from '../domain/ports/borrowing.port';
import { BooksModule } from '../../books/presentation/book.module';
import { BorrowersModule } from '../../borrowers/presentation/borrower.module';

@Module({
  imports: [
    BooksModule, // provides BOOK_REPOSITORY token
    BorrowersModule, // provides BORROWER_REPOSITORY token
  ],
  controllers: [BorrowingController],
  providers: [
    BorrowingService,
    BorrowingRepository,
    {
      provide: BORROWING_REPOSITORY,
      useExisting: BorrowingRepository,
    },
  ],
})
export class BorrowingModule {}
