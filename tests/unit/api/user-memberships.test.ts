import { GET, POST, PATCH } from '@/app/api/user/memberships/route';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'user_test123' })),
}));

// Mock clerk-user helper
jest.mock('@/lib/clerk-user', () => ({
  getOrCreateUser: jest.fn(() =>
    Promise.resolve({
      id: 'user1',
      clerkId: 'user_test123',
      email: 'test@example.com',
      name: 'Test User',
    })
  ),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
    userMembership: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
    },
    brand: {
      findUnique: jest.fn(),
    },
    customMembership: {
      create: jest.fn(),
    },
  },
}));

describe('/api/user/memberships', () => {
  const { prisma } = require('@/lib/prisma');

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_test123' });
    (getOrCreateUser as jest.Mock).mockResolvedValue({
      id: 'user1',
      clerkId: 'user_test123',
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  describe('GET', () => {
    it('should return user memberships when authenticated', async () => {
      const mockBrandMemberships = [
        {
          id: 'mem1',
          brandId: 'brand1',
          isActive: true,
          brand: { id: 'brand1', name: 'Test Brand', logoUrl: 'logo.png' },
        },
      ];

      const mockCustomMemberships = [
        {
          id: 'custom1',
          customMembershipId: 'custom1',
          isActive: true,
          customMembership: {
            id: 'custom1',
            name: 'Custom Brand',
            icon: 'icon.png',
            description: 'Custom description',
            category: 'food',
            type: 'free',
            cost: null,
          },
        },
      ];

      prisma.userMembership.findMany
        .mockResolvedValueOnce(mockBrandMemberships)
        .mockResolvedValueOnce(mockCustomMemberships);

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.memberships).toHaveLength(2);
      expect(prisma.userMembership.findMany).toHaveBeenCalledTimes(2);
    });

    it('should return 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST', () => {
    it('should create brand memberships', async () => {
      const mockBrand = {
        id: 'brand1',
        name: 'Test Brand',
        partnershipsFrom: [],
        partnershipsTo: [],
      };

      prisma.brand.findUnique.mockResolvedValue(mockBrand);
      prisma.userMembership.updateMany.mockResolvedValue({ count: 0 });
      prisma.userMembership.upsert.mockResolvedValue({
        id: 'mem1',
        userId: 'user1',
        brandId: 'brand1',
        isActive: true,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'POST',
          body: JSON.stringify({
            brandIds: ['brand1'],
            customMemberships: [],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('changesSavedSuccessfully');
      expect(prisma.userMembership.updateMany).toHaveBeenCalled();
      expect(prisma.userMembership.upsert).toHaveBeenCalled();
    });

    it('should create custom memberships', async () => {
      const mockCustomMembership = {
        id: 'custom1',
        name: 'Custom Brand',
        description: 'Custom description',
        category: 'food',
      };

      prisma.userMembership.updateMany.mockResolvedValue({ count: 0 });
      prisma.customMembership.create.mockResolvedValue(mockCustomMembership);
      prisma.userMembership.create.mockResolvedValue({
        id: 'mem1',
        userId: 'user1',
        customMembershipId: 'custom1',
        isActive: true,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'POST',
          body: JSON.stringify({
            brandIds: [],
            customMemberships: [mockCustomMembership],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('changesSavedSuccessfully');
      expect(prisma.customMembership.create).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      prisma.userMembership.updateMany.mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'POST',
          body: JSON.stringify({
            brandIds: ['brand1'],
            customMemberships: [],
          }),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it('should return 401 for POST when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'POST',
          body: JSON.stringify({
            brandIds: ['brand1'],
            customMemberships: [],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('PATCH remindEnabled', () => {
    it('should update remindEnabled for a brand membership', async () => {
      const existing = {
        id: 'mem1',
        userId: 'user1',
        brandId: 'brand1',
        remindEnabled: true,
        isActive: true,
      };
      const updated = { ...existing, remindEnabled: false };
      prisma.userMembership.findFirst.mockResolvedValue(existing);
      prisma.userMembership.update.mockResolvedValue(updated);

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'PATCH',
          body: JSON.stringify({
            brandId: 'brand1',
            remindEnabled: false,
          }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.membership.remindEnabled).toBe(false);
      expect(prisma.userMembership.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user1', brandId: 'brand1' },
      });
      expect(prisma.userMembership.update).toHaveBeenCalledWith({
        where: { id: 'mem1' },
        data: { remindEnabled: false },
      });
    });

    it('should update remindEnabled for a custom membership', async () => {
      const existing = {
        id: 'mem2',
        userId: 'user1',
        customMembershipId: 'custom1',
        remindEnabled: false,
        isActive: true,
      };
      const updated = { ...existing, remindEnabled: true };
      prisma.userMembership.findFirst.mockResolvedValue(existing);
      prisma.userMembership.update.mockResolvedValue(updated);

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'PATCH',
          body: JSON.stringify({
            customMembershipId: 'custom1',
            remindEnabled: true,
          }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.membership.remindEnabled).toBe(true);
      expect(prisma.userMembership.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user1', customMembershipId: 'custom1' },
      });
      expect(prisma.userMembership.update).toHaveBeenCalledWith({
        where: { id: 'mem2' },
        data: { remindEnabled: true },
      });
    });

    it('should return 400 when remindEnabled is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'PATCH',
          body: JSON.stringify({ brandId: 'brand1' }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/remindEnabled/);
      expect(prisma.userMembership.update).not.toHaveBeenCalled();
    });

    it('should return 400 when neither brandId nor customMembershipId is provided', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'PATCH',
          body: JSON.stringify({ remindEnabled: true }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/brandId or customMembershipId/);
    });

    it('should return 400 when both brandId and customMembershipId are provided', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'PATCH',
          body: JSON.stringify({
            brandId: 'brand1',
            customMembershipId: 'custom1',
            remindEnabled: true,
          }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/not both/);
      expect(prisma.userMembership.findFirst).not.toHaveBeenCalled();
    });

    it('should return 404 when membership row does not exist', async () => {
      prisma.userMembership.findFirst.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'PATCH',
          body: JSON.stringify({
            brandId: 'brand1',
            remindEnabled: false,
          }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Membership not found');
      expect(prisma.userMembership.update).not.toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'PATCH',
          body: JSON.stringify({
            brandId: 'brand1',
            remindEnabled: false,
          }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 500 when prisma update fails', async () => {
      prisma.userMembership.findFirst.mockResolvedValue({
        id: 'mem1',
        userId: 'user1',
        brandId: 'brand1',
      });
      prisma.userMembership.update.mockRejectedValue(new Error('DB error'));

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships',
        {
          method: 'PATCH',
          body: JSON.stringify({
            brandId: 'brand1',
            remindEnabled: false,
          }),
        }
      );

      const response = await PATCH(request);

      expect(response.status).toBe(500);
    });
  });

  describe('GET remindEnabled', () => {
    it('should include remindEnabled on brand and custom memberships', async () => {
      prisma.userMembership.findMany
        .mockResolvedValueOnce([
          {
            id: 'mem1',
            brandId: 'brand1',
            isActive: true,
            remindEnabled: false,
            brand: { id: 'brand1', name: 'BBB', logoUrl: 'logo.png' },
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'mem2',
            customMembershipId: 'custom1',
            isActive: true,
            remindEnabled: true,
            customMembership: {
              id: 'custom1',
              name: 'Custom Brand',
              icon: 'icon.png',
              description: 'Custom description',
              category: 'food',
              type: 'free',
              cost: null,
            },
          },
        ]);

      const request = new NextRequest(
        'http://localhost:3000/api/user/memberships'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.memberships[0].remindEnabled).toBe(false);
      expect(data.memberships[1].remindEnabled).toBe(true);
    });
  });
});
