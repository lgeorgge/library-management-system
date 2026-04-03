# Database Schema

erDiagram
BOOK {
string id PK
string title
string author
string isbn UK
string shelfLocation
int totalQuantity
int availableQuantity
datetime createdAt
datetime updatedAt
}

    BORROWER {
        string id PK
        string name
        string email UK
        datetime registeredAt
        datetime createdAt
        datetime updatedAt
    }

    BORROW_RECORD {
        string id PK
        string bookId FK
        string borrowerId FK
        datetime borrowedAt
        datetime dueDate
        datetime returnedAt
    }

## Notes

- `isbn` is unique on `Book`.
- `email` is unique on `Borrower`.
- `BorrowRecord.returnedAt = null` means the book is still checked out.
- Overdue books are records where `returnedAt IS NULL` and `dueDate < NOW()`.
