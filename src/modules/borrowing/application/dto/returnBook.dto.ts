import { IsNotEmpty, IsUUID } from 'class-validator';

export class ReturnBookDto {
  @IsUUID()
  @IsNotEmpty()
  borrowerId!: string;

  @IsUUID()
  @IsNotEmpty()
  bookId!: string;
}
