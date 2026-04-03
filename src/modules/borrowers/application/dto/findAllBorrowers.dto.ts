import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, Max } from 'class-validator';

export class FindAllBorrowersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}
