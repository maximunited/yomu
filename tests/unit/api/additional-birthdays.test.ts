jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'user_test123' })),
}));

jest.mock('@/lib/clerk-user', () => ({
  getOrCreateUser: jest.fn(() =>
    Promise.resolve({
      id: 'user-1',
      clerkId: 'user_test123',
      email: 'test@example.com',
      name: 'Test User',
    })
  ),
}));

jest.mock('@/lib/prisma', () => {
  const additionalBirthday = {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const $executeRaw = jest.fn();
  return {
    prisma: {
      additionalBirthday,
      $executeRaw,
      $transaction: jest.fn(async (fn: (tx: unknown) => unknown) =>
        fn({
          additionalBirthday,
          $executeRaw,
        })
      ),
    },
  };
});

import { GET, POST } from '@/app/api/user/additional-birthdays/route';
import { PUT, DELETE } from '@/app/api/user/additional-birthdays/[id]/route';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

describe('/api/user/additional-birthdays', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { prisma } = require('@/lib/prisma');

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_test123' });
    prisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => unknown) =>
        fn({
          additionalBirthday: prisma.additionalBirthday,
          $executeRaw: prisma.$executeRaw,
        })
    );
  });

  describe('GET', () => {
    it('returns additional birthdays for the user', async () => {
      const rows = [
        {
          id: 'ab-1',
          label: 'Maya',
          dateOfBirth: new Date('2015-04-01'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];
      prisma.additionalBirthday.findMany.mockResolvedValue(rows);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.additionalBirthdays).toHaveLength(1);
      expect(data.additionalBirthdays[0].label).toBe('Maya');
      expect(prisma.additionalBirthday.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } })
      );
    });

    it('returns 401 when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });
      const response = await GET();
      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('creates an additional birthday inside a locked transaction', async () => {
      prisma.additionalBirthday.count.mockResolvedValue(0);
      prisma.additionalBirthday.create.mockResolvedValue({
        id: 'ab-2',
        label: 'Spouse',
        dateOfBirth: new Date('1992-08-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/user/additional-birthdays',
        {
          method: 'POST',
          body: JSON.stringify({
            label: 'Spouse',
            dateOfBirth: '1992-08-20',
          }),
        }
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.additionalBirthday.label).toBe('Spouse');
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(prisma.additionalBirthday.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('rejects missing label', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/user/additional-birthdays',
        {
          method: 'POST',
          body: JSON.stringify({ label: '  ', dateOfBirth: '1992-08-20' }),
        }
      );
      const response = await POST(request);
      expect(response.status).toBe(400);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('enforces max of 10 inside the transaction', async () => {
      prisma.additionalBirthday.count.mockResolvedValue(10);
      const request = new NextRequest(
        'http://localhost:3000/api/user/additional-birthdays',
        {
          method: 'POST',
          body: JSON.stringify({
            label: 'Extra',
            dateOfBirth: '2000-01-01',
          }),
        }
      );
      const response = await POST(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.message).toBe('additionalBirthdayLimitReached');
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.additionalBirthday.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /[id]', () => {
    it('updates owned birthday', async () => {
      prisma.additionalBirthday.findFirst.mockResolvedValue({
        id: 'ab-1',
        userId: 'user-1',
      });
      prisma.additionalBirthday.update.mockResolvedValue({
        id: 'ab-1',
        label: 'Maya Updated',
        dateOfBirth: new Date('2015-04-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/user/additional-birthdays/ab-1',
        {
          method: 'PUT',
          body: JSON.stringify({ label: 'Maya Updated' }),
        }
      );
      const response = await PUT(request, {
        params: Promise.resolve({ id: 'ab-1' }),
      });
      expect(response.status).toBe(200);
    });

    it('returns 404 for other users birthday', async () => {
      prisma.additionalBirthday.findFirst.mockResolvedValue(null);
      const request = new NextRequest(
        'http://localhost:3000/api/user/additional-birthdays/ab-x',
        {
          method: 'PUT',
          body: JSON.stringify({ label: 'Nope' }),
        }
      );
      const response = await PUT(request, {
        params: Promise.resolve({ id: 'ab-x' }),
      });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /[id]', () => {
    it('deletes owned birthday', async () => {
      prisma.additionalBirthday.findFirst.mockResolvedValue({
        id: 'ab-1',
        userId: 'user-1',
      });
      prisma.additionalBirthday.delete.mockResolvedValue({});

      const request = new NextRequest(
        'http://localhost:3000/api/user/additional-birthdays/ab-1',
        { method: 'DELETE' }
      );
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'ab-1' }),
      });
      expect(response.status).toBe(200);
      expect(prisma.additionalBirthday.delete).toHaveBeenCalledWith({
        where: { id: 'ab-1' },
      });
    });
  });
});
