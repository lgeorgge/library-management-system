import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsString()
  shelfLocation?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalQuantity?: number;

  // availableQuantity should not be updated directly, it will be managed by the system based on borrow/return operations
}
