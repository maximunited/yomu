import { POST, PUT, DELETE } from '@/app/api/custom-memberships/route';
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
    customMembership: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    customBenefit: {
      create: jest.fn(),
    },
  },
}));

describe('/api/custom-memberships', () => {
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

  describe('POST', () => {
    it('should create a custom benefit', async () => {
      const mockCustomMembership = {
        id: 'custom1',
        userId: 'user1',
        name: 'Custom Brand',
      };

      const mockBenefit = {
        title: 'Custom Benefit',
        description: 'Custom description',
        redemptionMethod: 'online',
        validityType: 'birthday_month',
      };

      const mockCreatedBenefit = {
        id: 'benefit1',
        customMembershipId: 'custom1',
        ...mockBenefit,
        isActive: true,
      };

      prisma.customMembership.findFirst.mockResolvedValue(mockCustomMembership);
      prisma.customBenefit.create.mockResolvedValue(mockCreatedBenefit);

      const request = new NextRequest(
        'http://localhost:3000/api/custom-memberships',
        {
          method: 'POST',
          body: JSON.stringify({
            customMembershipId: 'custom1',
            benefit: mockBenefit,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('customMembershipCreated');
      expect(data.benefit).toEqual(mockCreatedBenefit);
      expect(prisma.customBenefit.create).toHaveBeenCalledWith({
        data: {
          customMembershipId: 'custom1',
          title: mockBenefit.title,
          description: mockBenefit.description,
          termsAndConditions: undefined,
          termsUrl: undefined,
          redemptionMethod: mockBenefit.redemptionMethod,
          promoCode: undefined,
          url: undefined,
          validityType: mockBenefit.validityType,
          validityDuration: undefined,
          isFree: undefined,
          isActive: true,
        },
      });
    });

    it('should return 400 for missing fields', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/custom-memberships',
        {
          method: 'POST',
          body: JSON.stringify({
            customMembershipId: 'custom1',
            // missing benefit
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('missingFields');
    });

    it('should return 404 for non-existent custom membership', async () => {
      prisma.customMembership.findFirst.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/custom-memberships',
        {
          method: 'POST',
          body: JSON.stringify({
            customMembershipId: 'nonexistent',
            benefit: { title: 'Test' },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('customMembershipNotFound');
    });
  });

  describe('PUT', () => {
    it('should update a custom membership', async () => {
      const mockCustomMembership = {
        id: 'custom1',
        userId: 'user1',
        name: 'Custom Brand',
      };

      const updatedMembership = {
        ...mockCustomMembership,
        name: 'Updated Custom Brand',
      };

      prisma.customMembership.findFirst.mockResolvedValue(mockCustomMembership);
      prisma.customMembership.update.mockResolvedValue(updatedMembership);

      const request = new NextRequest(
        'http://localhost:3000/api/custom-memberships',
        {
          method: 'PUT',
          body: JSON.stringify({
            customMembershipId: 'custom1',
            updates: { name: 'Updated Custom Brand' },
          }),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('customMembershipUpdated');
      expect(data.membership).toEqual(updatedMembership);
    });

    it('should return 400 for missing customMembershipId', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/custom-memberships',
        {
          method: 'PUT',
          body: JSON.stringify({
            updates: { name: 'Updated Name' },
          }),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('customMembershipIdRequired');
    });
  });

  describe('DELETE', () => {
    it('should delete a custom membership', async () => {
      const mockCustomMembership = {
        id: 'custom1',
        userId: 'user1',
        name: 'Custom Brand',
      };

      prisma.customMembership.findFirst.mockResolvedValue(mockCustomMembership);
      prisma.customMembership.delete.mockResolvedValue(mockCustomMembership);

      const request = new NextRequest(
        'http://localhost:3000/api/custom-memberships?id=custom1',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('customMembershipDeleted');
      expect(prisma.customMembership.delete).toHaveBeenCalledWith({
        where: { id: 'custom1' },
      });
    });

    it('should return 400 for missing id parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/custom-memberships',
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('customMembershipIdRequired');
    });
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      const request = new NextRequest(
        'http://localhost:3000/api/custom-memberships',
        {
          method: 'POST',
          body: JSON.stringify({
            customMembershipId: 'custom1',
            benefit: { title: 'Test' },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
