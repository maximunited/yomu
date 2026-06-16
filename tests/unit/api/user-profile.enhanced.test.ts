import { PUT, GET } from '@/app/api/user/profile/route';
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from 'next/server';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'user_test123' })),
}));

// Mock clerk-user helper
jest.mock('@/lib/clerk-user', () => ({
  getOrCreateUser: jest.fn(() =>
    Promise.resolve({
      id: 'user-123',
      clerkId: 'user_test123',
      email: 'test@example.com',
      name: 'Test User',
    })
  ),
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('/api/user/profile Enhanced Tests', () => {
  const mockAuth = require('@clerk/nextjs/server').auth;
  const mockGetOrCreateUser = require('@/lib/clerk-user').getOrCreateUser;
  const { prisma } = require('@/lib/prisma');

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.log for tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    // Reset default mocks
    mockAuth.mockResolvedValue({ userId: 'user_test123' });
    mockGetOrCreateUser.mockResolvedValue({
      id: 'user-123',
      clerkId: 'user_test123',
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('PUT /api/user/profile', () => {
    it('should update profile with valid session', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'user-123',
        name: 'Updated Name',
        email: 'test@example.com',
        dateOfBirth: new Date('1990-01-01'),
        anniversaryDate: null,
        profilePicture: null,
      });

      const requestBody = {
        name: 'Updated Name',
        dateOfBirth: '1990-01-01',
        anniversaryDate: null,
        profilePicture: null,
      };

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify(requestBody),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('profileUpdatedSuccessfully');
      expect(data.user.name).toBe('Updated Name');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          name: 'Updated Name',
          dateOfBirth: new Date('1990-01-01'),
          anniversaryDate: undefined,
          profilePicture: undefined,
        },
      });
    });

    it('should handle anniversary date correctly', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        anniversaryDate: new Date('2020-06-15'),
      });

      const requestBody = {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        anniversaryDate: '2020-06-15',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify(requestBody),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          name: 'Test User',
          dateOfBirth: new Date('1990-01-01'),
          anniversaryDate: new Date('2020-06-15'),
          profilePicture: undefined,
        },
      });
    });

    it('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify({ name: 'Test' }),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle database errors gracefully', async () => {
      prisma.user.update.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify({ name: 'Test User' }),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('profileUpdateError');
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: 'invalid json',
        }
      );

      const response = await PUT(request);

      expect(response.status).toBe(500);
    });

    it('should handle profile picture updates', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        profilePicture: 'base64-image-data',
      });

      const requestBody = {
        name: 'Test User',
        profilePicture: 'base64-image-data',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          profilePicture: 'base64-image-data',
        }),
      });
    });
  });

  describe('GET /api/user/profile', () => {
    it('should return user profile with valid session', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        dateOfBirth: new Date('1990-01-01'),
        anniversaryDate: null,
        profilePicture: null,
      });

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.name).toBe('Test User');
      expect(data.user.email).toBe('test@example.com');
    });

    it('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('userNotFound');
    });
  });
});
