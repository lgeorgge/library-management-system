import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateBorrowerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsDateString()
  @IsNotEmpty()
  registeredAt!: string;
}
