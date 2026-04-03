import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BOOK_REPOSITORY } from '../../domain/ports/book.port';
import type { IBookRepository } from '../../domain/ports/book.port';
import { CreateBookDto } from '../dto/createBook.dto';
import { SearchBooksDto } from '../dto/searchBook.dto';
import { UpdateBookDto } from '../dto/updateBook.dto';

@Injectable()
export class BooksService {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async create(createBookDto: CreateBookDto) {
    const existingBook = await this.bookRepository.findByIsbn(
      createBookDto.isbn,
    );

    if (existingBook) {
      throw new ConflictException('A book with this ISBN already exists.');
    }

    try {
      return this.bookRepository.create({
        ...createBookDto,
        availableQuantity: createBookDto.totalQuantity,
      });
    } catch (error) {
      console.error('Error creating book:', error);
      throw new BadRequestException('Failed to create book. Please try again.');
    }
  }

  async findAll() {
    return this.bookRepository.findAll();
  }

  async findOne(id: string) {
    const book = await this.bookRepository.findById(id);

    if (!book) {
      throw new NotFoundException('Book not found.');
    }

    return book;
  }

  async search(searchDto: SearchBooksDto) {
    const hasAtLeastOneFilter =
      !!searchDto.title || !!searchDto.author || !!searchDto.isbn;

    if (!hasAtLeastOneFilter) {
      throw new BadRequestException(
        'At least one search parameter is required.',
      );
    }

    return this.bookRepository.search(searchDto);
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    const existingBook = await this.bookRepository.findById(id);

    if (!existingBook) {
      throw new NotFoundException('Book not found.');
    }

    if (updateBookDto.isbn && updateBookDto.isbn !== existingBook.isbn) {
      const isbnOwner = await this.bookRepository.findByIsbn(
        updateBookDto.isbn,
      );

      // This to avoid adding two books with the same ISBN
      if (isbnOwner) {
        throw new ConflictException('Another book already uses this ISBN.');
      }
    }

    if (updateBookDto.totalQuantity !== undefined) {
      const borrowedCount =
        existingBook.totalQuantity - existingBook.availableQuantity;

      if (updateBookDto.totalQuantity < borrowedCount) {
        throw new BadRequestException(
          'Total quantity cannot be less than borrowed copies.',
        );
      }

      const newAvailableQuantity = updateBookDto.totalQuantity - borrowedCount;

      try {
        return this.bookRepository.update(id, {
          ...updateBookDto,
          availableQuantity: newAvailableQuantity,
        });
      } catch (error) {
        console.error('Error updating book:', error);
        throw new BadRequestException(
          'Failed to update book. Please try again.',
        );
      }
    }
  }

  async remove(id: string) {
    const existingBook = await this.bookRepository.findById(id);

    if (!existingBook) {
      throw new NotFoundException('Book not found.');
    }

    const borrowedCount =
      existingBook.totalQuantity - existingBook.availableQuantity;

    if (borrowedCount > 0) {
      throw new BadRequestException(
        'Cannot delete a book while copies are borrowed.',
      );
    }

    try {
      await this.bookRepository.delete(id);
    } catch (error) {
      console.error('Error deleting book:', error);
      throw new BadRequestException('Failed to delete book. Please try again.');
    }

    return {
      message: 'Book deleted successfully.',
    };
  }
}
