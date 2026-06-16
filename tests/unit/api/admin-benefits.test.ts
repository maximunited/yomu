/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@clerk/nextjs/server';
import * as prismaClient from '@/lib/prisma';
import { GET as GET_LIST, POST } from '@/app/api/admin/benefits/route';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'user_test123' })),
}));
jest.mock('@/lib/prisma', () => ({
  prisma: { benefit: { findMany: jest.fn(), create: jest.fn() } },
}));

describe('/api/admin/benefits', () => {
  beforeEach(() => {
    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: 'user_test123',
    });
  });

  it('GET returns all benefits', async () => {
    (prismaClient.prisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([
      { id: 'x1' },
    ]);
    const res = await GET_LIST();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual([{ id: 'x1' }]);
  });

  it('POST creates a benefit', async () => {
    (prismaClient.prisma.benefit.create as jest.Mock).mockResolvedValueOnce({
      id: 'new1',
    });
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        brandId: 'b1',
        title: 'T',
        description: 'D',
        redemptionMethod: 'M',
        validityType: 'birthday',
        isFree: true,
        isActive: true,
      }),
    } as any) as any;
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json).toEqual({ id: 'new1' });
  });

  it('GET returns 401 when not authenticated', async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });
    const res = await GET_LIST();
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });
});
