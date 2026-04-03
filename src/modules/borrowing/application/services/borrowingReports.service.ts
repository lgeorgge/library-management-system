import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  BORROWING_REPOSITORY,
  BorrowingReportRecord,
  BorrowingScopeType,
} from '../../domain/ports/borrowing.port';
import type { IBorrowingRepository } from '../../domain/ports/borrowing.port';
import {
  BorrowingReportQueryDto,
  BorrowingScope,
  ExportBorrowingReportDto,
  ExportFormat,
  ExportLastMonthBorrowingReportDto,
} from '../dto/borrowingReport.dto';
import { BorrowingExportService, ExportRow } from './borrowingExport.service';

type BorrowingStatus = 'returned' | 'active' | 'overdue';

type BorrowingReportItem = {
  id: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  borrower: {
    name: string;
    email: string;
  };
  book: {
    title: string;
    isbn: string;
  };
  status: BorrowingStatus;
};

@Injectable()
export class BorrowingReportsService {
  constructor(
    @Inject(BORROWING_REPOSITORY)
    private readonly borrowingRepository: IBorrowingRepository,
    private readonly borrowingExportService: BorrowingExportService,
  ) {}

  async getReport(dto: BorrowingReportQueryDto) {
    const { from, to } = this.normalizeDateRange(dto.from, dto.to);
    const records = await this.borrowingRepository.findBorrowings(
      from,
      to,
      BorrowingScope.ALL,
    );

    return this.buildReportResponse(from, to, records);
  }

  async export(dto: ExportBorrowingReportDto) {
    this.assertXlsxOnly(dto.format);

    const { from, to } = this.normalizeDateRange(dto.from, dto.to);
    const scope = dto.scope as BorrowingScopeType;
    const records = await this.borrowingRepository.findBorrowings(
      from,
      to,
      scope,
    );

    return this.borrowingExportService.exportXlsx(
      this.toExportRows(records),
      `borrowing-report-${scope}-${this.toFileDate(from)}-to-${this.toFileDate(to)}`,
    );
  }

  async exportLastMonth(dto: ExportLastMonthBorrowingReportDto) {
    this.assertXlsxOnly(dto.format);

    const scope = dto.scope as BorrowingScopeType;
    const { from, to } = this.getLastMonthRange();
    const records = await this.borrowingRepository.findBorrowings(
      from,
      to,
      scope,
    );

    return this.borrowingExportService.exportXlsx(
      this.toExportRows(records),
      `borrowing-report-last-month-${scope}`,
    );
  }

  private buildReportResponse(
    from: Date,
    to: Date,
    records: BorrowingReportRecord[],
  ) {
    const now = new Date();
    const returnedCount = records.filter(
      (record) => !!record.returnedAt,
    ).length;
    const activeCount = records.length - returnedCount;
    const overdueCount = records.filter(
      (record) => !record.returnedAt && record.dueDate < now,
    ).length;

    const uniqueBorrowers = new Set(
      records.map((record) => record.borrower.email),
    ).size;
    const uniqueBooks = new Set(records.map((record) => record.book.isbn)).size;

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      totals: {
        totalBorrowings: records.length,
        returnedCount,
        activeCount,
        overdueCount,
        uniqueBorrowers,
        uniqueBooks,
      },
      items: records.map((record) => this.mapToReportItem(record)),
    };
  }

  private mapToReportItem(record: BorrowingReportRecord): BorrowingReportItem {
    return {
      id: record.id,
      borrowedAt: record.borrowedAt.toISOString(),
      dueDate: record.dueDate.toISOString(),
      returnedAt: record.returnedAt ? record.returnedAt.toISOString() : null,
      borrower: {
        name: record.borrower.name,
        email: record.borrower.email,
      },
      book: {
        title: record.book.title,
        isbn: record.book.isbn,
      },
      status: this.getStatus(record),
    };
  }

  private toExportRows(records: BorrowingReportRecord[]): ExportRow[] {
    return records.map((record) => ({
      borrowerName: record.borrower.name,
      borrowerEmail: record.borrower.email,
      bookTitle: record.book.title,
      bookIsbn: record.book.isbn,
      borrowedAt: record.borrowedAt.toISOString(),
      dueDate: record.dueDate.toISOString(),
      returnedAt: record.returnedAt ? record.returnedAt.toISOString() : null,
      status: this.getStatus(record),
    }));
  }

  private normalizeDateRange(fromInput: string, toInput: string) {
    const from = new Date(fromInput);
    const to = new Date(toInput);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid date range.');
    }

    from.setUTCHours(0, 0, 0, 0);
    to.setUTCHours(23, 59, 59, 999);

    if (from > to) {
      throw new BadRequestException('from date must be before or equal to to.');
    }

    return { from, to };
  }

  private getLastMonthRange() {
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const from = new Date(
      Date.UTC(
        firstDayOfCurrentMonth.getUTCFullYear(),
        firstDayOfCurrentMonth.getUTCMonth() - 1,
        1,
        0,
        0,
        0,
        0,
      ),
    );

    const to = new Date(
      Date.UTC(
        firstDayOfCurrentMonth.getUTCFullYear(),
        firstDayOfCurrentMonth.getUTCMonth(),
        0,
        23,
        59,
        59,
        999,
      ),
    );

    return { from, to };
  }

  private getStatus(record: BorrowingReportRecord): BorrowingStatus {
    if (record.returnedAt) {
      return 'returned';
    }

    if (record.dueDate < new Date()) {
      return 'overdue';
    }

    return 'active';
  }

  private assertXlsxOnly(format: ExportFormat) {
    if (format !== ExportFormat.XLSX) {
      throw new BadRequestException('Only xlsx format is supported.');
    }
  }

  private toFileDate(value: Date) {
    return value.toISOString().slice(0, 10);
  }
}
