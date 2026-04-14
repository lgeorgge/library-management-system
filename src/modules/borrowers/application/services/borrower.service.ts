import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BORROWER_REPOSITORY } from '../../domain/ports/borrower.port';
import type { IBorrowerRepository } from '../../domain/ports/borrower.port';
import { CreateBorrowerDto } from '../dto/createBorrower.dto';
import { UpdateBorrowerDto } from '../dto/updateBorrower.dto';

@Injectable()
export class BorrowersService {
  constructor(
    @Inject(BORROWER_REPOSITORY)
    private readonly borrowerRepository: IBorrowerRepository,
  ) {}

  async create(createBorrowerDto: CreateBorrowerDto) {
    const existing = await this.borrowerRepository.findByEmail(
      createBorrowerDto.email,
    );

    if (existing) {
      throw new ConflictException('A borrower with this email already exists.');
    }

    try {
      return this.borrowerRepository.create({
        ...createBorrowerDto,
        registeredAt: new Date(createBorrowerDto.registeredAt),
      });
    } catch (error) {
      console.error('Error creating borrower:', error);
      throw new BadRequestException(
        'Failed to create borrower. Please try again.',
      );
    }
  }

  async findAll(
    pagination: { page: number | undefined; pageSize: number | undefined },
    filters: { search: string | undefined },
  ) {
    return await this.borrowerRepository.findAll(pagination, filters);
  }

  async findOne(id: string) {
    const borrower = await this.borrowerRepository.findById(id);

    if (!borrower) {
      throw new NotFoundException('Borrower not found.');
    }

    return borrower;
  }

  async update(id: string, updateBorrowerDto: UpdateBorrowerDto) {
    const existing = await this.borrowerRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Borrower not found.');
    }

    // Check email uniqueness only if email is being changed
    if (updateBorrowerDto.email && updateBorrowerDto.email !== existing.email) {
      const emailOwner = await this.borrowerRepository.findByEmail(
        updateBorrowerDto.email,
      );

      if (emailOwner) {
        throw new ConflictException(
          'Another borrower already uses this email.',
        );
      }
    }

    try {
      return this.borrowerRepository.update(id, updateBorrowerDto);
    } catch (error) {
      console.error('Error updating borrower:', error);
      throw new BadRequestException(
        'Failed to update borrower. Please try again.',
      );
    }
  }

  async remove(id: string) {
    const existing = await this.borrowerRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Borrower not found.');
    }

    const hasActive = await this.borrowerRepository.hasActiveBorrows(id);

    if (hasActive) {
      throw new BadRequestException(
        'Cannot delete a borrower who has books currently checked out.',
      );
    }

    try {
      await this.borrowerRepository.delete(id);
    } catch (error) {
      console.error('Error deleting borrower:', error);
      throw new BadRequestException(
        'Failed to delete borrower. Please try again.',
      );
    }

    return { message: 'Borrower deleted successfully.' };
  }
}
