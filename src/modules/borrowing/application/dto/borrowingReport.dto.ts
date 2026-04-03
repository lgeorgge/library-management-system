import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum ExportFormat {
  // There is only one type for now, but we can easily add more in the future (e.g., CSV, PDF)
  // I used Xslx as I have just used it in a previous project and it worked well.
  XLSX = 'xlsx',
}

export enum BorrowingScope {
  ALL = 'all',
  OVERDUE = 'overdue',
}

export class BorrowingReportQueryDto {
  @IsDateString()
  @IsNotEmpty()
  from!: string;

  @IsDateString()
  @IsNotEmpty()
  to!: string;
}

export class ExportBorrowingReportDto extends BorrowingReportQueryDto {
  @IsEnum(ExportFormat)
  format!: ExportFormat;

  @IsEnum(BorrowingScope)
  scope!: BorrowingScope;
}

export class ExportLastMonthBorrowingReportDto {
  @IsOptional()
  @IsEnum(ExportFormat)
  format: ExportFormat = ExportFormat.XLSX;

  @IsOptional()
  @IsEnum(BorrowingScope)
  scope: BorrowingScope = BorrowingScope.ALL;
}
