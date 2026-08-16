jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'user_test123' })),
}));

jest.mock('@/lib/clerk-user', () => ({
  getOrCreateUser: jest.fn(() =>
    Promise.resolve({
      id: 'user-1',
      clerkId: 'user_test123',
    })
  ),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { GET, PATCH } from '@/app/api/user/notification-preferences/route';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

describe('/api/user/notification-preferences', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { prisma } = require('@/lib/prisma');

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_test123' });
  });

  it('GET returns persisted preferences', async () => {
    prisma.user.findUnique.mockResolvedValue({
      notifyEmail: true,
      notifyPush: false,
      notifySms: true,
      phoneNumber: '+972501234567',
    });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.preferences).toEqual({
      email: true,
      push: false,
      sms: true,
      phoneNumber: '+972501234567',
    });
  });

  it('PATCH updates notification fields', async () => {
    prisma.user.update.mockResolvedValue({
      notifyEmail: false,
      notifyPush: true,
      notifySms: false,
      phoneNumber: null,
    });

    const req = new NextRequest(
      'http://localhost:3000/api/user/notification-preferences',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: false, push: true }),
      }
    );

    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.preferences.email).toBe(false);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: { notifyEmail: false, notifyPush: true },
      })
    );
  });

  it('returns 401 when unauthenticated', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: null });
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
