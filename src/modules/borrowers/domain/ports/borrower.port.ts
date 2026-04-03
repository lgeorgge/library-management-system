export const BORROWER_REPOSITORY = Symbol('BORROWER_REPOSITORY');

export interface IBorrowerRepository {
  create(data: {
    name: string;
    email: string;
    registeredAt: Date;
  }): Promise<{ id: string }>;

  findAll(
    pagination: { page: number | undefined; pageSize: number | undefined },
    filters: { search: string | undefined },
  ): Promise<{
    borrowers: {
      id: string;
      name: string;
      email: string;
      registeredAt: Date;
    }[];
    total: number;
  }>;

  findById(id: string): Promise<{
    id: string;
    name: string;
    email: string;
    registeredAt: Date;
  } | null>;

  // Used to check for duplicate emails on create/update
  findByEmail(email: string): Promise<{ id: string } | null>;

  // Check if borrower has any active (not returned) borrow records before deletion
  hasActiveBorrows(borrowerId: string): Promise<boolean>;

  update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
    }>,
  ): Promise<{ id: string }>;

  delete(id: string): Promise<{ id: string }>;
}
