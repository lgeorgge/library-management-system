import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CheckoutDto {
  @IsUUID()
  @IsNotEmpty()
  borrowerId!: string;

  @IsUUID()
  @IsNotEmpty()
  bookId!: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;
}
