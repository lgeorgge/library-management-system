import { Controller, Get, Query, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { BorrowingReportsService } from '../application/services/borrowingReports.service';
import {
  BorrowingReportQueryDto,
  ExportBorrowingReportDto,
  ExportLastMonthBorrowingReportDto,
} from '../application/dto/borrowingReport.dto';

@Controller('borrowing-reports')
export class BorrowingReportsController {
  constructor(private readonly reportsService: BorrowingReportsService) {}

  @Get()
  getReport(@Query() dto: BorrowingReportQueryDto) {
    return this.reportsService.getReport(dto);
  }

  @Get('export')
  async export(
    @Query() dto: ExportBorrowingReportDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.reportsService.export(dto);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
    });

    return new StreamableFile(file.buffer);
  }

  @Get('export/last-month')
  async exportLastMonth(
    @Query() dto: ExportLastMonthBorrowingReportDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.reportsService.exportLastMonth(dto);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
    });

    return new StreamableFile(file.buffer);
  }
}
