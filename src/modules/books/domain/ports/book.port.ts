export const BOOK_REPOSITORY = Symbol('BOOK_REPOSITORY');

export interface IBookRepository {
  create(data: {
    title: string;
    author: string;
    isbn: string;
    shelfLocation: string;
    totalQuantity: number;
    availableQuantity: number;
  }): Promise<{ id: string }>;

  findAll(
    pagination: { page: number; pageSize: number },
    filters: { search?: string },
  ): Promise<{
    books: {
      id: string;
      title: string;
      author: string;
      isbn: string;
      shelfLocation: string;
      totalQuantity: number;
      availableQuantity: number;
    }[];
    total: number;
  }>;

  findById(id: string): Promise<{
    id: string;
    isbn: string;
    title: string;
    author: string;
    shelfLocation: string;
    totalQuantity: number;
    availableQuantity: number;
  } | null>;

  // Find by ISBN to check for duplicates when creating or updating a book
  findByIsbn(isbn: string): Promise<{
    id: string;
  } | null>;

  search(filters: { title?: string; author?: string; isbn?: string }): Promise<{
    books: {
      id: string;
      title: string;
      author: string;
      isbn: string;
      shelfLocation: string;
      totalQuantity: number;
      availableQuantity: number;
    }[];
    total: number;
  }>;

  update(
    id: string,
    data: Partial<{
      title: string;
      author: string;
      isbn: string;
      shelfLocation: string;
      totalQuantity: number;
      availableQuantity: number;
    }>,
  ): Promise<{ id: string; availableQuantity: number }>;

  delete(id: string): Promise<{ id: string }>;
}
