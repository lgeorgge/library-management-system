import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { BooksModule } from './modules/books/presentation/book.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally (.env)
    }),
    PrismaModule,
    BooksModule,
  ],
})
export class AppModule {}
