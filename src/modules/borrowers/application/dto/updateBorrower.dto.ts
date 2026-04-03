import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateBorrowerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
