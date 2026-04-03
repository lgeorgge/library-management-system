/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BooksService } from './book.service';
import { BOOK_REPOSITORY, IBookRepository } from '../../domain/ports/book.port';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;

  // Mock implementation of the IBookRepository ==> Fake repository for testing
  const mockBookRepository: jest.Mocked<IBookRepository> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIsbn: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: BOOK_REPOSITORY,
          useValue: mockBookRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  // Test cases for BooksService methods
  describe('create', () => {
    it('should create a book and set availableQuantity = totalQuantity', async () => {
      const dto = {
        title: 'Nader Fouda - Al-Athem',
        author: 'Ahmed Youness',
        isbn: '9784651325014',
        shelfLocation: 'A-1',
        totalQuantity: 100,
      };

      mockBookRepository.findByIsbn.mockResolvedValue(null);
      mockBookRepository.create.mockResolvedValue({
        id: '1',
        ...dto,
        availableQuantity: 100,
      } as any);

      const result = await service.create(dto);

      expect(mockBookRepository.findByIsbn).toHaveBeenCalledWith(dto.isbn);
      expect(mockBookRepository.create).toHaveBeenCalledWith({
        ...dto,
        availableQuantity: 100,
      });
      expect(result.id).toBeDefined();
    });

    it('should throw ConflictException when ISBN already exists', async () => {
      const dto = {
        title: 'Nader Fouda - Al-Athem',
        author: 'Ahmed Youness',
        isbn: '9784651325014',
        shelfLocation: 'A-1',
        totalQuantity: 100,
      };

      mockBookRepository.findByIsbn.mockResolvedValue({
        id: 'existing-book',
        ...dto,
        availableQuantity: 5,
      } as any);

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a book when found', async () => {
      const book = {
        id: '1',
        title: 'Nader Fouda - Al-Athem',
        author: 'Ahmed Youness',
        isbn: '9784651325014',
        shelfLocation: 'A-1',
        totalQuantity: 100,
      };

      mockBookRepository.findById.mockResolvedValue(book as any);

      const result = await service.findOne('1');

      expect(result).toEqual(book);
      expect(mockBookRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when book does not exist', async () => {
      mockBookRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update totalQuantity and recalculate availableQuantity', async () => {
      const existingBook = {
        title: 'Nader Fouda - Al-Athem',
        author: 'Ahmed Youness',
        isbn: '9784651325014',
        shelfLocation: 'A-1',
        totalQuantity: 100,
        availableQuantity: 95, // 5 borrowed
      };

      mockBookRepository.findById.mockResolvedValue(existingBook as any);
      mockBookRepository.update.mockResolvedValue({
        ...existingBook,
        totalQuantity: 20,
        availableQuantity: 15, // 20 total - 5 borrowed = 15 available
      } as any);

      const result = await service.update('1', {
        totalQuantity: 20,
      });

      expect(mockBookRepository.update).toHaveBeenCalledWith('1', {
        totalQuantity: 20,
        availableQuantity: 15, // 20 total - 5 borrowed = 15 available
      });
      expect(result!.availableQuantity).toBe(15); // 20 total - 5 borrowed = 15 available
    });

    it('should throw BadRequestException when new totalQuantity is less than borrowed copies', async () => {
      const existingBook = {
        id: '1',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        shelfLocation: 'A-12',
        totalQuantity: 5,
        availableQuantity: 3, // 2 borrowed
      };

      mockBookRepository.findById.mockResolvedValue(existingBook as any);

      await expect(
        service.update('1', { totalQuantity: 1 }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a book when no copies are borrowed', async () => {
      const existingBook = {
        id: '1',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        shelfLocation: 'A-12',
        totalQuantity: 5,
        availableQuantity: 5,
      };

      mockBookRepository.findById.mockResolvedValue(existingBook as any);
      mockBookRepository.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');

      expect(mockBookRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'Book deleted successfully.' });
    });

    it('should throw BadRequestException when borrowed copies exist', async () => {
      const existingBook = {
        id: '1',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        shelfLocation: 'A-12',
        totalQuantity: 5,
        availableQuantity: 4, // 1 borrowed
      };

      mockBookRepository.findById.mockResolvedValue(existingBook as any);

      await expect(service.remove('1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(mockBookRepository.delete).not.toHaveBeenCalled();
    });
  });
});
