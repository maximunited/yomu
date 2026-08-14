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

jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

import { GET, PATCH } from '@/app/api/user/notifications/route';
import {
  DELETE,
  PATCH as PATCH_BY_ID,
} from '@/app/api/user/notifications/[id]/route';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { REMINDER_TYPE_UPCOMING } from '@/lib/reminders';

describe('/api/user/notifications', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { prisma } = require('@/lib/prisma');

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_test123' });
  });

  describe('GET', () => {
    it('returns notifications for the signed-in user', async () => {
      const createdAt = new Date('2026-08-14T10:00:00.000Z');
      prisma.notification.findMany.mockResolvedValue([
        {
          id: 'n1',
          title: 'Reminder',
          message: 'Benefit soon',
          type: REMINDER_TYPE_UPCOMING,
          isRead: false,
          createdAt,
          benefit: {
            id: 'b1',
            title: 'Free burger',
            brand: { name: "McDonald's" },
          },
        },
      ]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notifications).toHaveLength(1);
      expect(data.notifications[0].uiType).toBe('warning');
      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        })
      );
    });

    it('returns 401 when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });
      const response = await GET();
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH (mark all read)', () => {
    it('marks all unread notifications as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 2 });

      const request = new NextRequest(
        'http://localhost/api/user/notifications',
        {
          method: 'PATCH',
          body: JSON.stringify({ markAllRead: true }),
        }
      );
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updated).toBe(2);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: { isRead: true },
      });
    });

    it('rejects invalid body', async () => {
      const request = new NextRequest(
        'http://localhost/api/user/notifications',
        {
          method: 'PATCH',
          body: JSON.stringify({ isRead: true }),
        }
      );
      const response = await PATCH(request);
      expect(response.status).toBe(400);
    });
  });
});

describe('/api/user/notifications/[id]', () => {
  const { prisma } = require('@/lib/prisma');

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_test123' });
  });

  describe('PATCH', () => {
    it('marks a single notification as read for the owner', async () => {
      const createdAt = new Date('2026-08-14T10:00:00.000Z');
      prisma.notification.updateMany.mockResolvedValue({ count: 1 });
      prisma.notification.findFirst.mockResolvedValue({
        id: 'n1',
        title: 'Reminder',
        message: 'Benefit soon',
        type: REMINDER_TYPE_UPCOMING,
        isRead: true,
        createdAt,
        benefit: null,
      });

      const request = new NextRequest(
        'http://localhost/api/user/notifications/n1',
        {
          method: 'PATCH',
          body: JSON.stringify({ isRead: true }),
        }
      );
      const response = await PATCH_BY_ID(request, {
        params: Promise.resolve({ id: 'n1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notification.isRead).toBe(true);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'n1', userId: 'user-1' },
        data: { isRead: true },
      });
    });

    it('returns 404 when notification is not owned by user', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      const request = new NextRequest(
        'http://localhost/api/user/notifications/n-missing',
        {
          method: 'PATCH',
          body: JSON.stringify({ isRead: true }),
        }
      );
      const response = await PATCH_BY_ID(request, {
        params: Promise.resolve({ id: 'n-missing' }),
      });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE', () => {
    it('deletes a notification scoped to the user', async () => {
      prisma.notification.deleteMany.mockResolvedValue({ count: 1 });

      const request = new NextRequest(
        'http://localhost/api/user/notifications/n1',
        { method: 'DELETE' }
      );
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'n1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.deleted).toBe(true);
      expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
        where: { id: 'n1', userId: 'user-1' },
      });
    });

    it('returns 404 when nothing deleted', async () => {
      prisma.notification.deleteMany.mockResolvedValue({ count: 0 });

      const request = new NextRequest(
        'http://localhost/api/user/notifications/n-missing',
        { method: 'DELETE' }
      );
      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'n-missing' }),
      });
      expect(response.status).toBe(404);
    });
  });
});
