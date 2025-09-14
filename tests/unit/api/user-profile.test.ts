// Mock NextAuth first
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {},
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
import { getServerSession } from 'next-auth';

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;

describe('/api/user/profile', () => {
  const { prisma } = require('@/lib/prisma');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return user profile with authenticated session', async () => {
      const mockSession = { user: { id: 'session-user-id' } };
      const mockUser = {
        id: 'session-user-id',
        name: 'Test User',
        email: 'test@example.com',
        dateOfBirth: new Date('1990-01-01'),
        anniversaryDate: new Date('2020-06-15'),
        profilePicture: 'https://example.com/profile.jpg',
      };

      mockGetServerSession.mockResolvedValue(mockSession);
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
      expect(consoleSpy).toHaveBeenCalledWith('Session:', 'Found');
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
        },
      });

      consoleSpy.mockRestore();
    });

    it('should use test user when no session', async () => {
      const mockTestUser = { id: 'test-user-id' };
      const mockUser = {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        dateOfBirth: null,
        anniversaryDate: null,
        profilePicture: null,
      };

      mockGetServerSession.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue(mockTestUser);
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const consoleSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual(mockUser);

      expect(consoleSpy).toHaveBeenCalledWith('Session:', 'Not found');
      expect(consoleSpy).toHaveBeenCalledWith(
        'No session user ID, using test user ID'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Using test user ID:',
        'test-user-id'
      );

      consoleSpy.mockRestore();
    });

    it('should return 401 when no session and no users', async () => {
      mockGetServerSession.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue(null);

      const consoleSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        message: 'unauthorized',
        error: 'AUTHENTICATION_REQUIRED',
      });

      expect(consoleSpy).toHaveBeenCalledWith('No users found in database');
      consoleSpy.mockRestore();
    });

    it('should return 404 when user not found', async () => {
      const mockSession = { user: { id: 'nonexistent-user' } };

      mockGetServerSession.mockResolvedValue(mockSession);
      prisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('userNotFound');
    });

    it('should handle database errors', async () => {
      const mockSession = { user: { id: 'session-user-id' } };
      const mockError = new Error('Database connection failed');

      mockGetServerSession.mockResolvedValue(mockSession);
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
      const mockSession = { user: { id: 'session-user-id' } };
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

      mockGetServerSession.mockResolvedValue(mockSession);
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
      expect(consoleSpy).toHaveBeenCalledWith('Session:', 'Found');
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
      const mockSession = { user: { id: 'session-user-id' } };
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

      mockGetServerSession.mockResolvedValue(mockSession);
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
          anniversaryDate: undefined,
          profilePicture: undefined,
        },
      });
    });

    it('should use test user when no session for PUT', async () => {
      const mockTestUser = { id: 'test-user-id' };
      const updateData = { name: 'Test Update' };
      const mockUpdatedUser = {
        id: 'test-user-id',
        name: 'Test Update',
        email: 'test@example.com',
        dateOfBirth: null,
        anniversaryDate: null,
        profilePicture: null,
      };

      mockGetServerSession.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue(mockTestUser);
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

      expect(response.status).toBe(200);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Using test user ID:',
        'test-user-id'
      );

      consoleSpy.mockRestore();
    });

    it('should return 401 for PUT when no session and no users', async () => {
      mockGetServerSession.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue(null);

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
      expect(data).toEqual({
        message: 'unauthorized',
        error: 'AUTHENTICATION_REQUIRED',
      });
    });

    it('should handle database update errors', async () => {
      const mockSession = { user: { id: 'session-user-id' } };
      const updateData = { name: 'Test Update' };
      const mockError = new Error('Update failed');

      mockGetServerSession.mockResolvedValue(mockSession);
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
      const mockSession = { user: { id: 'session-user-id' } };
      const updateData = { name: 'Test Update' };

      mockGetServerSession.mockResolvedValue(mockSession);
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
      const mockSession = { user: { id: 'session-user-id' } };
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

      mockGetServerSession.mockResolvedValue(mockSession);
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

    it('should log session user correctly', async () => {
      const mockSession = {
        user: {
          id: 'session-user-id',
          name: 'Session User',
          email: 'session@example.com',
        },
      };
      const mockUpdatedUser = {
        id: 'session-user-id',
        name: 'Updated',
        email: 'session@example.com',
        dateOfBirth: null,
        anniversaryDate: null,
        profilePicture: null,
      };

      mockGetServerSession.mockResolvedValue(mockSession);
      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      const consoleSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        }
      );
      await PUT(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Session user:',
        mockSession.user
      );

      consoleSpy.mockRestore();
    });
  });
});
