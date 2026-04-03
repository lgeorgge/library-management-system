import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BorrowingService } from '../application/services/borrowing.service';
import { CheckoutDto } from '../application/dto/checkout.dto';
import { ReturnBookDto } from '../application/dto/returnBook.dto';

@Controller('borrowing')
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) {}

  // POST /borrowing/checkout — check out a book
  @Post('checkout')
  checkout(@Body() checkoutDto: CheckoutDto) {
    return this.borrowingService.checkout(checkoutDto);
  }

  // POST /borrowing/return — return a book
  @Post('return')
  returnBook(@Body() returnBookDto: ReturnBookDto) {
    return this.borrowingService.returnBook(returnBookDto);
  }

  // GET /borrowing/overdue — list all overdue borrow records
  @Get('overdue')
  getOverdue() {
    return this.borrowingService.getOverdue();
  }

  // GET /borrowing/borrower/:borrowerId — books currently checked out by a borrower
  @Get('borrower/:borrowerId')
  getBorrowerBooks(@Param('borrowerId') borrowerId: string) {
    return this.borrowingService.getBorrowerBooks(borrowerId);
  }
}
