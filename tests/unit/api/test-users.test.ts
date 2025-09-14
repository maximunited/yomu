/* eslint-disable @typescript-eslint/no-require-imports */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/test-users/route';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

// Mock NextRequest
const createMockRequest = () => {
  return new NextRequest('http://localhost:3000/api/test-users');
};

describe('/api/test-users', () => {
  const mockPrisma = require('@/lib/prisma').prisma;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return success response with users list', async () => {
    const mockUsers = [
      {
        id: 'user1',
        email: 'test1@example.com',
        name: 'Test User 1',
        createdAt: new Date('2023-01-01'),
      },
      {
        id: 'user2',
        email: 'test2@example.com',
        name: 'Test User 2',
        createdAt: new Date('2023-01-02'),
      },
    ];

    mockPrisma.user.findMany.mockResolvedValue(mockUsers);

    // Spy on console.log to verify logging
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      userCount: 2,
      users: mockUsers.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      })),
    });

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '=== Testing users in database ==='
    );
    expect(consoleSpy).toHaveBeenCalledWith('Found 2 users:', mockUsers);

    consoleSpy.mockRestore();
  });

  it('should return success response with empty users list', async () => {
    mockPrisma.user.findMany.mockResolvedValue([]);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      userCount: 0,
      users: [],
    });

    expect(consoleSpy).toHaveBeenCalledWith('Found 0 users:', []);

    consoleSpy.mockRestore();
  });

  it('should return error response when database query fails', async () => {
    const mockError = new Error('Database query failed');
    mockPrisma.user.findMany.mockRejectedValue(mockError);

    // Spy on console.error to verify error logging
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      message: 'failedToFetchUsers',
      error: 'Database query failed',
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error testing users:', mockError);

    consoleSpy.mockRestore();
  });

  it('should handle non-Error exceptions', async () => {
    mockPrisma.user.findMany.mockRejectedValue('String error');

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      message: 'failedToFetchUsers',
      error: 'Unknown error',
    });

    consoleSpy.mockRestore();
  });

  it('should call findMany with correct select fields', async () => {
    mockPrisma.user.findMany.mockResolvedValue([]);

    const request = createMockRequest();
    await GET(request);

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  });
});
