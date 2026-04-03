import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { BooksModule } from './modules/books/presentation/book.module';
import { BorrowingModule } from './modules/borrowing/presentation/borrowing.module';
import { BorrowersModule } from './modules/borrowers/presentation/borrower.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally (.env)
    }),
    PrismaModule,
    BooksModule,
    BorrowingModule,
    BorrowersModule,
  ],
})
export class AppModule {}
