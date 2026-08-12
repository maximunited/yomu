// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'user_test123' })),
}));

// Mock clerk-user helper
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

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { GET, PUT } from '@/app/api/user/profile/route';
/* eslint-disable @typescript-eslint/no-require-imports */
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';

describe('/api/user/profile', () => {
  const { prisma } = require('@/lib/prisma');

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default mocks
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_test123' });
    (getOrCreateUser as jest.Mock).mockResolvedValue({
      id: 'session-user-id',
      clerkId: 'user_test123',
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return user profile with authenticated session', async () => {
      const mockUser = {
        id: 'session-user-id',
        name: 'Test User',
        email: 'test@example.com',
        dateOfBirth: new Date('1990-01-01'),
        anniversaryDate: new Date('2020-06-15'),
        profilePicture: 'https://example.com/profile.jpg',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const consoleSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual({
        ...mockUser,
        dateOfBirth: mockUser.dateOfBirth.toISOString(),
        anniversaryDate: mockUser.anniversaryDate.toISOString(),
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '=== Starting GET request to /api/user/profile ==='
      );
      expect(consoleSpy).toHaveBeenCalledWith('Profile loaded successfully');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-user-id' },
        select: {
          id: true,
          name: true,
          email: true,
          dateOfBirth: true,
          anniversaryDate: true,
          profilePicture: true,
          additionalBirthdays: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              label: true,
              dateOfBirth: true,
            },
          },
        },
      });

      consoleSpy.mockRestore();
    });

    it('should return 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 404 when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('userNotFound');
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');

      prisma.user.findUnique.mockRejectedValue(mockError);

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        message: 'profileLoadError',
        error: 'Database connection failed',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching profile:',
        mockError
      );
      consoleSpy.mockRestore();
    });
  });

  describe('PUT', () => {
    it('should update user profile with all fields', async () => {
      const updateData = {
        name: 'Updated Name',
        dateOfBirth: '1990-01-01',
        anniversaryDate: '2020-06-15',
        profilePicture: 'https://example.com/new-profile.jpg',
      };
      const mockUpdatedUser = {
        id: 'session-user-id',
        name: 'Updated Name',
        email: 'test@example.com',
        dateOfBirth: new Date('1990-01-01'),
        anniversaryDate: new Date('2020-06-15'),
        profilePicture: 'https://example.com/new-profile.jpg',
      };

      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      const consoleSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('profileUpdatedSuccessfully');
      expect(data.user).toEqual({
        ...mockUpdatedUser,
        dateOfBirth: mockUpdatedUser.dateOfBirth.toISOString(),
        anniversaryDate: mockUpdatedUser.anniversaryDate.toISOString(),
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '=== Starting PUT request to /api/user/profile ==='
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Updating profile for user:',
        'session-user-id'
      );
      expect(consoleSpy).toHaveBeenCalledWith('Profile updated successfully');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'session-user-id' },
        data: {
          name: 'Updated Name',
          dateOfBirth: new Date('1990-01-01'),
          anniversaryDate: new Date('2020-06-15'),
          profilePicture: 'https://example.com/new-profile.jpg',
        },
      });

      consoleSpy.mockRestore();
    });

    it('should update user profile with partial fields', async () => {
      const updateData = {
        name: 'Updated Name Only',
      };
      const mockUpdatedUser = {
        id: 'session-user-id',
        name: 'Updated Name Only',
        email: 'test@example.com',
        dateOfBirth: null,
        anniversaryDate: null,
        profilePicture: null,
      };

      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.name).toBe('Updated Name Only');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'session-user-id' },
        data: {
          name: 'Updated Name Only',
          dateOfBirth: undefined,
          profilePicture: undefined,
        },
      });
    });

    it('should clear anniversaryDate when null is sent', async () => {
      const mockUpdatedUser = {
        id: 'session-user-id',
        name: 'Test User',
        email: 'test@example.com',
        dateOfBirth: new Date('1990-01-01'),
        anniversaryDate: null,
        profilePicture: null,
      };
      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify({
            name: 'Test User',
            dateOfBirth: '1990-01-01',
            anniversaryDate: null,
          }),
        }
      );
      const response = await PUT(request);
      expect(response.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'session-user-id' },
        data: {
          name: 'Test User',
          dateOfBirth: new Date('1990-01-01'),
          anniversaryDate: null,
          profilePicture: undefined,
        },
      });
    });

    it('should return 401 for PUT when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

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
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database update errors', async () => {
      const updateData = { name: 'Test Update' };
      const mockError = new Error('Update failed');

      prisma.user.update.mockRejectedValue(mockError);

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        message: 'profileUpdateError',
        error: 'Update failed',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating profile:',
        mockError
      );
      consoleSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      const updateData = { name: 'Test Update' };

      prisma.user.update.mockRejectedValue('String error');

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Unknown error');

      consoleSpy.mockRestore();
    });

    it('should log profile data correctly', async () => {
      const updateData = {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        anniversaryDate: '2020-06-15',
        profilePicture: 'data:image/png;base64,test',
      };
      const mockUpdatedUser = {
        id: 'session-user-id',
        name: 'Test User',
        email: 'test@example.com',
        dateOfBirth: new Date('1990-01-01'),
        anniversaryDate: new Date('2020-06-15'),
        profilePicture: 'data:image/png;base64,test',
      };

      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      const consoleSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );
      await PUT(request);

      expect(consoleSpy).toHaveBeenCalledWith('Profile data:', {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        anniversaryDate: '2020-06-15',
        profilePicture: 'present',
      });

      consoleSpy.mockRestore();
    });
  });
});
