import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

export type ExportRow = {
  borrowerName: string;
  borrowerEmail: string;
  bookTitle: string;
  bookIsbn: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: 'returned' | 'active' | 'overdue';
};

export type ExportedFile = {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
};

@Injectable()
export class BorrowingExportService {
  async exportXlsx(
    rows: ExportRow[],
    fileBaseName: string,
  ): Promise<ExportedFile> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Borrowings');

    worksheet.columns = [
      { header: 'Borrower Name', key: 'borrowerName', width: 24 },
      { header: 'Borrower Email', key: 'borrowerEmail', width: 30 },
      { header: 'Book Title', key: 'bookTitle', width: 30 },
      { header: 'Book ISBN', key: 'bookIsbn', width: 20 },
      { header: 'Borrowed At', key: 'borrowedAt', width: 24 },
      { header: 'Due Date', key: 'dueDate', width: 24 },
      { header: 'Returned At', key: 'returnedAt', width: 24 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    rows.forEach((row) => worksheet.addRow(row));

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    return {
      buffer,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileName: `${fileBaseName}.xlsx`,
    };
  }
}
