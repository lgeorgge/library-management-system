# Library Management System API Endpoints

Base URL prefix: `/api`

Validation is enabled globally with:

- `whitelist: true` (unknown properties are stripped)
- `forbidNonWhitelisted: true` (unknown properties trigger validation errors)
- `transform: true`

## Books Module

Controller: `BooksController`  
Base route: `/api/books`

### 1. Create Book

- **Method:** `POST`
- **Path:** `/api/books`
- **Body:**

```json
{
  "title": "string",
  "author": "string",
  "isbn": "string",
  "shelfLocation": "string",
  "totalQuantity": 3
}
```

- **Rules:**
- `title`, `author`, `isbn`, `shelfLocation` are required non-empty strings.
- `totalQuantity` is required integer and must be `>= 0`.
- ISBN must be unique.
- `availableQuantity` is set automatically to `totalQuantity`.
- **Response (201):**

```json
{
  "id": "book-uuid"
}
```

### 2. Get All Books

- **Method:** `GET`
- **Path:** `/api/books`
- **Response (200):**

```json
{
  "books": [
    {
      "id": "book-uuid",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "9780132350884",
      "shelfLocation": "A-1",
      "totalQuantity": 5,
      "availableQuantity": 3
    }
  ],
  "total": 1
}
```

### 3. Search Books

- **Method:** `GET`
- **Path:** `/api/books/search`
- **Query params (optional individually, but at least one required):**
- `title`: string
- `author`: string
- `isbn`: string
- **Rules:**
- Request fails if none of the query params are provided.
- **Response (200):**

```json
{
  "books": [
    {
      "title": "Nader Fouda - Al-Athem",
      "author": "Ahmed Youness",
      "isbn": "9784651325014",
      "shelfLocation": "A-1",
      "totalQuantity": 100,
      "availableQuantity": 95
    }
  ],
  "total": 1
}
```

### 4. Get Book By ID

- **Method:** `GET`
- **Path:** `/api/books/:id`
- **Path params:**
- `id`: string
- **Response (200):**

```json
{
  "title": "Nader Fouda - Al-Athem",
  "author": "Ahmed Youness",
  "isbn": "9784651325014",
  "shelfLocation": "A-1",
  "totalQuantity": 100,
  "availableQuantity": 95
}
```

### 5. Update Book

- **Method:** `PATCH`
- **Path:** `/api/books/:id`
- **Path params:**
- `id`: string
- **Body (all fields optional):**

```json
{
  "title": "string",
  "author": "string",
  "isbn": "string",
  "shelfLocation": "string",
  "totalQuantity": 0
}
```

- **Rules:**
- Updated ISBN must remain unique.
- `totalQuantity` cannot be less than currently borrowed copies.
- `availableQuantity` is recalculated automatically when `totalQuantity` changes.
- **Response (200):**

```json
{
  "id": "book-uuid",
  "availableQuantity": 95
}
```

### 6. Delete Book

- **Method:** `DELETE`
- **Path:** `/api/books/:id`
- **Path params:**
- `id`: string
- **Rules:**
- Cannot delete while any copies are currently borrowed.
- **Response (200):**

```json
{
  "message": "Book deleted successfully."
}
```

## Borrowers Module

Controller: `BorrowersController`  
Base route: `/api/borrowers`

### 1. Create Borrower

- **Method:** `POST`
- **Path:** `/api/borrowers`
- **Body:**

```json
{
  "name": "string",
  "email": "user@example.com",
  "registeredAt": "2026-01-01T00:00:00.000Z"
}
```

- **Rules:**
- `name` is required non-empty string.
- `email` is required valid email and must be unique.
- `registeredAt` is required valid ISO date string.
- **Response (201):**

```json
{
  "id": "borrower-uuid"
}
```

### 2. Get All Borrowers

- **Method:** `GET`
- **Path:** `/api/borrowers`
- **Response (200):**

```json
{
  "borrowers": [
    {
      "id": "borrower-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "registeredAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### 3. Get Borrower By ID

- **Method:** `GET`
- **Path:** `/api/borrowers/:id`
- **Path params:**
- `id`: string
- **Response (200):**

```json
{
  "id": "borrower-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "registeredAt": "2026-01-01T00:00:00.000Z"
}
```

### 4. Update Borrower

- **Method:** `PATCH`
- **Path:** `/api/borrowers/:id`
- **Path params:**
- `id`: string
- **Body (all fields optional):**

```json
{
  "name": "string",
  "email": "user@example.com"
}
```

- **Rules:**
- If email is updated, it must remain unique.
- **Response (200):**

```json
{
  "id": "borrower-uuid"
}
```

### 5. Delete Borrower

- **Method:** `DELETE`
- **Path:** `/api/borrowers/:id`
- **Path params:**
- `id`: string
- **Rules:**
- Cannot delete borrower with active borrowed books.
- **Response (200):**

```json
{
  "message": "Borrower deleted successfully."
}
```

## Borrowing Module

Controller: `BorrowingController`  
Base route: `/api/borrowing`

### 1. Checkout Book

- **Method:** `POST`
- **Path:** `/api/borrowing/checkout`
- **Body:**

```json
{
  "borrowerId": "uuid",
  "bookId": "uuid",
  "dueDate": "2026-12-31T00:00:00.000Z"
}
```

- **Rules:**
- `borrowerId` and `bookId` must be valid UUIDs.
- `dueDate` must be valid ISO date string in the future.
- Borrower must exist.
- Book must exist and have available copies.
- Borrower cannot check out the same book twice at the same time.
- **Response (201):**

```json
{
  "id": "borrow-record-uuid"
}
```

### 2. Return Book

- **Method:** `POST`
- **Path:** `/api/borrowing/return`
- **Body:**

```json
{
  "borrowerId": "uuid",
  "bookId": "uuid"
}
```

- **Rules:**
- `borrowerId` and `bookId` must be valid UUIDs.
- Borrower and book must exist.
- There must be an active borrow record for this borrower/book pair.
- **Response (201):**

```json
{
  "id": "borrow-record-uuid"
}
```

### 3. Get Overdue Borrows

- **Method:** `GET`
- **Path:** `/api/borrowing/overdue`
- **Response (200):**

```json
[
  {
    "id": "borrow-record-uuid",
    "borrowedAt": "2026-02-01T10:00:00.000Z",
    "dueDate": "2026-02-14T10:00:00.000Z",
    "borrower": {
      "id": "borrower-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "book": {
      "id": "book-uuid",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "9780132350884"
    }
  }
]
```

### 4. Get Active Borrows By Borrower

- **Method:** `GET`
- **Path:** `/api/borrowing/borrower/:borrowerId`
- **Path params:**
- `borrowerId`: string
- **Rules:**
- Borrower must exist.
- **Response (200):**

```json
[
  {
    "id": "borrow-record-uuid",
    "borrowedAt": "2026-03-01T10:00:00.000Z",
    "dueDate": "2026-03-15T10:00:00.000Z",
    "book": {
      "id": "book-uuid",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "9780132350884"
    }
  }
]
```

## Borrowing Reports Module

Controller: `BorrowingReportsController`  
Base route: `/api/borrowing-reports`

### 1. Get Borrowing Report (Analytics + Items)

- **Method:** `GET`
- **Path:** `/api/borrowing-reports`
- **Query params (required):**
- `from`: ISO date string (example: `2026-03-01`)
- `to`: ISO date string (example: `2026-03-31`)
- **Response (200):**

```json
{
  "from": "2026-03-01T00:00:00.000Z",
  "to": "2026-03-31T23:59:59.999Z",
  "totals": {
    "totalBorrowings": 25,
    "returnedCount": 18,
    "activeCount": 7,
    "overdueCount": 3,
    "uniqueBorrowers": 10,
    "uniqueBooks": 14
  },
  "items": [
    {
      "id": "borrow-record-uuid",
      "borrowedAt": "2026-03-12T09:00:00.000Z",
      "dueDate": "2026-03-26T09:00:00.000Z",
      "returnedAt": null,
      "borrower": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "book": {
        "title": "Clean Code",
        "isbn": "9780132350884"
      },
      "status": "overdue"
    }
  ]
}
```

### 2. Export Borrowing Report (XLSX)

- **Method:** `GET`
- **Path:** `/api/borrowing-reports/export`
- **Query params (required):**
- `from`: ISO date string
- `to`: ISO date string
- `scope`: `all` | `overdue`
- `format`: `xlsx`
- **Response (200):**
- Binary file stream (`.xlsx`)
- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename="borrowing-report-... .xlsx"`

### 3. Export Last Month Borrowing Report (XLSX)

- **Method:** `GET`
- **Path:** `/api/borrowing-reports/export/last-month`
- **Query params (optional):**
- `scope`: `all` | `overdue` (default: `all`)
- `format`: `xlsx` (default: `xlsx`)
- **Response (200):**
- Binary file stream (`.xlsx`)
- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename="borrowing-report-last-month-... .xlsx"`
