import { Injectable } from '@nestjs/common';
import { IBorrowerRepository } from '../../domain/ports/borrower.port';
import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class BorrowerRepository implements IBorrowerRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    registeredAt: Date;
  }): Promise<{ id: string }> {
    return this.prisma.borrower.create({
      data,
      select: { id: true },
    });
  }

  async findAll(): Promise<{
    borrowers: {
      id: string;
      name: string;
      email: string;
      registeredAt: Date;
    }[];
    total: number;
  }> {
    const [borrowers, total] = await Promise.all([
      this.prisma.borrower.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          registeredAt: true,
        },
      }),
      this.prisma.borrower.count(),
    ]);

    return { borrowers, total };
  }

  async findById(id: string): Promise<{
    id: string;
    name: string;
    email: string;
    registeredAt: Date;
  } | null> {
    return this.prisma.borrower.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        registeredAt: true,
      },
    });
  }

  async findByEmail(email: string): Promise<{ id: string } | null> {
    return this.prisma.borrower.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  async hasActiveBorrows(borrowerId: string): Promise<boolean> {
    const count = await this.prisma.borrowRecord.count({
      where: {
        borrowerId,
        returnedAt: null,
      },
    });
    return count > 0;
  }

  async update(
    id: string,
    data: Partial<{ name: string; email: string }>,
  ): Promise<{ id: string }> {
    return this.prisma.borrower.update({
      where: { id },
      data,
      select: { id: true },
    });
  }

  async delete(id: string): Promise<{ id: string }> {
    return this.prisma.borrower.delete({
      where: { id },
      select: { id: true },
    });
  }
}
