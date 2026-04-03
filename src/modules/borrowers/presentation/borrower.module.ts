import { Module } from '@nestjs/common';
import { BorrowersController } from './borrower.controller';
import { BorrowersService } from '../application/services/borrower.service';
import { BorrowerRepository } from '../infrastructure/repositories/borrower.repository';
import { BORROWER_REPOSITORY } from '../domain/ports/borrower.port';

@Module({
  controllers: [BorrowersController],
  providers: [
    BorrowersService,
    BorrowerRepository,
    {
      provide: BORROWER_REPOSITORY,
      useExisting: BorrowerRepository,
    },
  ],
  exports: [BorrowersService],
})
export class BorrowersModule {}
