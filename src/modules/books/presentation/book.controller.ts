import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BooksService } from '../application/services/book.service';
import { CreateBookDto } from '../application/dto/createBook.dto';
import { SearchBooksDto } from '../application/dto/searchBook.dto';
import { UpdateBookDto } from '../application/dto/updateBook.dto';
import { FindAllBooksDto } from '../application/dto/findAllBooks.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // POST /books — create a new book
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  // GET /books — list all books with pagination and optional search
  // Example: GET /books?page=1&pageSize=10&search=harry
  @Get()
  findAll(@Query() query: FindAllBooksDto) {
    const { page, pageSize, search } = query;

    const pagination = { page: page || 1, pageSize: pageSize || 10 };
    const filters = { search };

    return this.booksService.findAll(pagination, filters);
  }

  // Get /books/search?title=harry&author=rowling&isbn=1234567890 — search books by title, author, or ISBN
  // This basicilly is the same as the search functionality in the findAll endpoint, but separated for assessment reasons
  @Get('search')
  search(@Query() searchDto: SearchBooksDto) {
    return this.booksService.search(searchDto);
  }

  // GET /books/:id — get details of a specific book
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  // PATCH /books/:id — update book details
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  // DELETE /books/:id — delete a book
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}
