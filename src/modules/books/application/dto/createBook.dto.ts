import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  author!: string;

  @IsString()
  @IsNotEmpty()
  isbn!: string;

  @IsString()
  @IsNotEmpty()
  shelfLocation!: string;

  @IsInt()
  @Min(0)
  totalQuantity!: number;
}
