import { Injectable } from '@nestjs/common';
import { IBookRepository } from '../../domain/ports/book.port';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UpdateBookDto } from '../../application/dto/updateBook.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookRepository implements IBookRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    author: string;
    isbn: string;
    shelfLocation: string;
    totalQuantity: number;
    availableQuantity: number;
  }): Promise<{ id: string }> {
    const createdBookId = await this.prisma.book.create({
      data: {
        ...data,
      },
      select: {
        id: true,
      },
    });

    return createdBookId;
  }

  async findAll(
    pagination?: { page: number; pageSize: number },
    orderBy?: { field: string; direction: 'asc' | 'desc' },
  ) {
    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        skip: pagination
          ? (pagination.page - 1) * pagination.pageSize
          : undefined,
        take: pagination?.pageSize,
        orderBy: orderBy
          ? {
              [orderBy.field]: orderBy.direction,
            }
          : {
              title: 'asc',
            },
        select: {
          id: true,
          title: true,
          author: true,
          isbn: true,
          shelfLocation: true,
          totalQuantity: true,
          availableQuantity: true,
        },
      }),
      this.prisma.book.count(),
    ]);

    return { books, total };
  }

  async findById(id: string) {
    return await this.prisma.book.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        shelfLocation: true,
        totalQuantity: true,
        availableQuantity: true,
      },
    });
  }

  async search(filters: { title?: string; author?: string; isbn?: string }) {
    const whereFilters: Prisma.BookWhereInput = {};

    if (filters.title) {
      whereFilters.OR?.push({
        title: { contains: filters.title, mode: 'insensitive' },
      });
    }
    if (filters.author) {
      whereFilters.OR?.push({
        author: { contains: filters.author, mode: 'insensitive' },
      });
    }
    if (filters.isbn) {
      whereFilters.OR?.push({
        isbn: { contains: filters.isbn, mode: 'insensitive' },
      });
    }

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where: whereFilters,
        select: {
          id: true,
          title: true,
          author: true,
          isbn: true,
          shelfLocation: true,
          totalQuantity: true,
          availableQuantity: true,
        },
      }),
      this.prisma.book.count({
        where: whereFilters,
      }),
    ]);

    return { books, total };
  }

  async update(
    id: string,
    data: UpdateBookDto,
  ): Promise<{ id: string; availableQuantity: number }> {
    return await this.prisma.book.update({
      where: { id },
      data,
      select: { id: true, availableQuantity: true },
    });
  }

  async delete(id: string) {
    return await this.prisma.book.delete({
      where: { id },
      select: { id: true },
    });
  }

  findByIsbn(isbn: string): Promise<{ id: string } | null> {
    return this.prisma.book.findUnique({
      where: { isbn },
      select: { id: true },
    });
  }
}
