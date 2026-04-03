import { Module } from '@nestjs/common';
import { BooksController } from './book.controller';
import { BooksService } from '../application/services/book.service';
import { BookRepository } from '../infrastructure/repositories/book.repository';
import { BOOK_REPOSITORY } from '../domain/ports/book.port';
import { PrismaModule } from '../../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BooksController],
  providers: [
    BooksService,
    BookRepository,
    {
      provide: BOOK_REPOSITORY,
      useExisting: BookRepository,
    },
  ],
  exports: [BooksService, BOOK_REPOSITORY],
})
export class BooksModule {}
