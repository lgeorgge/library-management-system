import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv/config';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const books = [
  {
    title: 'Zokak el-Madaq',
    author: 'Naguib Mahfouz',
    isbn: '9789770922910',
    shelfLocation: 'EG-A1',
    totalQuantity: 8,
  },
  {
    title: 'AL-Sukkariyya',
    author: 'Naguib Mahfouz',
    isbn: '9789770922927',
    shelfLocation: 'EG-A2',
    totalQuantity: 7,
  },
  {
    title: 'Qasr el-Shawq',
    author: 'Naguib Mahfouz',
    isbn: '9789770922934',
    shelfLocation: 'EG-A3',
    totalQuantity: 6,
  },
  {
    title: 'Shre3 el-Sa3ada',
    author: 'Naguib Mahfouz',
    isbn: '9789770922941',
    shelfLocation: 'EG-A4',
    totalQuantity: 6,
  },
  {
    title: 'KHAN EL-KHALILI',
    author: 'Naguib Mahfouz',
    isbn: '9789770922958',
    shelfLocation: 'EG-A5',
    totalQuantity: 5,
  },
  {
    title: 'The Yacoubian Building',
    author: 'Alaa Al Aswany',
    isbn: '9789770922965',
    shelfLocation: 'EG-B1',
    totalQuantity: 9,
  },
  {
    title: 'Chicago',
    author: 'Alaa Al Aswany',
    isbn: '9789770922972',
    shelfLocation: 'EG-B2',
    totalQuantity: 5,
  },
  {
    title: 'Utopia',
    author: 'Ahmed Khaled Towfik',
    isbn: '9789770922989',
    shelfLocation: 'EG-B3',
    totalQuantity: 10,
  },
  {
    title: 'Fe mamar elfe2ran',
    author: 'Ahmed Khaled Towfik',
    isbn: '9789770922996',
    shelfLocation: 'EG-B4',
    totalQuantity: 7,
  },
  {
    title: 'Metro',
    author: 'Magdy El Shafee',
    isbn: '9789770923009',
    shelfLocation: 'EG-C1',
    totalQuantity: 4,
  },
  {
    title: 'Taxi',
    author: 'Khaled Al Khamissi',
    isbn: '9789770923016',
    shelfLocation: 'EG-C2',
    totalQuantity: 6,
  },
  {
    title: 'The Queue',
    author: 'Basma Abdel Aziz',
    isbn: '9789770923023',
    shelfLocation: 'EG-C3',
    totalQuantity: 6,
  },
  {
    title: 'Celestial Bodies',
    author: 'Jokha Alharthi',
    isbn: '9789770923030',
    shelfLocation: 'AR-D1',
    totalQuantity: 5,
  },
  {
    title: 'Season of Migration to the North',
    author: 'Tayeb Salih',
    isbn: '9789770923047',
    shelfLocation: 'AR-D2',
    totalQuantity: 5,
  },
  {
    title: 'Frankenstein in Baghdad',
    author: 'Ahmed Saadawi',
    isbn: '9789770923054',
    shelfLocation: 'AR-D3',
    totalQuantity: 8,
  },
];

const borrowers = [
  {
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    registeredAt: new Date('2025-01-10T09:00:00.000Z'),
  },
  {
    name: 'Mariam Ali',
    email: 'mariam.ali@example.com',
    registeredAt: new Date('2025-02-14T09:00:00.000Z'),
  },
  {
    name: 'Youssef Omar',
    email: 'youssef.omar@example.com',
    registeredAt: new Date('2025-03-20T09:00:00.000Z'),
  },
  {
    name: 'Nourhan Mostafa',
    email: 'nourhan.mostafa@example.com',
    registeredAt: new Date('2025-04-05T09:00:00.000Z'),
  },
  {
    name: 'Karim Adel',
    email: 'karim.adel@example.com',
    registeredAt: new Date('2025-05-18T09:00:00.000Z'),
  },
];

async function main() {
  for (const book of books) {
    await prisma.book.create({
      data: {
        ...book,
        availableQuantity: book.totalQuantity,
      },
    });
  }

  for (const borrower of borrowers) {
    await prisma.borrower.create({
      data: borrower,
    });
  }

  console.log(
    `Seed completed: ${books.length} books and ${borrowers.length} borrowers.`,
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
