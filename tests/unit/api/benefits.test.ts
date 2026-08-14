/* eslint-disable @typescript-eslint/no-require-imports */
// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'user_test123' })),
}));

// Mock clerk-user helper
jest.mock('@/lib/clerk-user', () => ({
  getOrCreateUser: jest.fn(() =>
    Promise.resolve({
      id: 'session-user-id',
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
    },
    benefit: {
      findMany: jest.fn(),
    },
  },
}));

import { GET } from '@/app/api/benefits/route';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/clerk-user';
import { setBenefitClock, resetBenefitClock } from '@/lib/benefit-validation';

describe('/api/benefits', () => {
  const { prisma } = require('@/lib/prisma');

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ userId: 'user_test123' });
    (getOrCreateUser as jest.Mock).mockResolvedValue({
      id: 'session-user-id',
      clerkId: 'user_test123',
      email: 'test@example.com',
      name: 'Test User',
      dateOfBirth: new Date(1990, 5, 15), // Jun 15
    });
  });

  afterEach(() => {
    resetBenefitClock();
    // Clear console mocks after each test
    jest.restoreAllMocks();
  });

  it('should return benefits list with authenticated user', async () => {
    const mockMemberships = [
      {
        id: 'membership1',
        userId: 'session-user-id',
        brandId: 'brand1',
        isActive: true,
        brand: {
          id: 'brand1',
          name: 'Test Brand',
          benefits: [
            {
              id: 'benefit1',
              title: 'Brand Benefit',
              isActive: true,
            },
          ],
        },
      },
    ];
    const mockBenefits = [
      {
        id: '1',
        title: 'Birthday Discount',
        description: '10% off on birthday',
        brandId: 'brand1',
        validityType: 'birthday_exact_date',
        validityDuration: 1,
        redemptionMethod: 'in-store',
        isFree: true,
        promoCode: 'BIRTHDAY10',
        termsAndConditions: 'Valid for 1 day',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        brand: {
          id: 'brand1',
          name: 'Test Brand',
          logoUrl: 'https://example.com/logo.png',
          website: 'https://example.com',
          category: 'food',
          actionUrl: 'https://action.example.com',
          actionType: 'external',
          actionLabel: 'Shop Now',
        },
      },
    ];

    prisma.userMembership.findMany.mockResolvedValue(mockMemberships);
    prisma.benefit.findMany.mockResolvedValue(mockBenefits);

    // Spy on console.log to verify logging
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.benefits).toBeDefined();
    expect(data.memberships).toBe(1);
    expect(data.benefits).toHaveLength(1);
    expect(data.evaluatedAt).toBeDefined();

    const benefit = data.benefits[0];
    expect(benefit.title).toBe('Birthday Discount');
    expect(benefit.description).toBe('10% off on birthday');
    expect(benefit.promoCode).toBe('BIRTHDAY10');
    expect(benefit.url).toBe('https://example.com');
    expect(benefit.brand.name).toBe('Test Brand');
    expect(benefit.brand.actionUrl).toBe('https://action.example.com');
    expect(benefit.windowStatus).toMatch(/^(active|upcoming|none)$/);

    expect(consoleSpy).toHaveBeenCalledWith(
      '=== Starting GET request to /api/benefits ==='
    );

    consoleSpy.mockRestore();
  });

  it('should classify windowStatus using asOf and user DOB', async () => {
    const mockBenefits = [
      {
        id: 'exact',
        title: 'Exact day',
        description: 'Only on birthday',
        brandId: 'brand1',
        validityType: 'birthday_exact_date',
        validityDuration: 1,
        redemptionMethod: 'in-store',
        isFree: true,
        promoCode: null,
        termsAndConditions: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        brand: {
          id: 'brand1',
          name: 'Test Brand',
          logoUrl: 'https://example.com/logo.png',
          website: 'https://example.com',
          category: 'food',
          actionUrl: null,
          actionType: null,
          actionLabel: null,
        },
      },
      {
        id: 'month',
        title: 'Whole month',
        description: 'Birthday month',
        brandId: 'brand1',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        redemptionMethod: 'in-store',
        isFree: false,
        promoCode: null,
        termsAndConditions: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        brand: {
          id: 'brand1',
          name: 'Test Brand',
          logoUrl: 'https://example.com/logo.png',
          website: 'https://example.com',
          category: 'food',
          actionUrl: null,
          actionType: null,
          actionLabel: null,
        },
      },
    ];

    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockResolvedValue(mockBenefits);

    const req = {
      nextUrl: {
        searchParams: new URLSearchParams('asOf=2024-06-15'),
      },
    } as unknown as import('next/server').NextRequest;

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    // Local calendar day 2024-06-15 — ISO may be prior UTC day depending on TZ
    const evaluated = new Date(data.evaluatedAt);
    expect(evaluated.getFullYear()).toBe(2024);
    expect(evaluated.getMonth()).toBe(5);
    expect(evaluated.getDate()).toBe(15);

    const byId = Object.fromEntries(
      data.benefits.map((b: { id: string; windowStatus: string }) => [
        b.id,
        b.windowStatus,
      ])
    );
    expect(byId.exact).toBe('active');
    expect(byId.month).toBe('active');
  });

  it('ignores asOf in production unless ALLOW_BENEFIT_ASOF=1', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalAllow = process.env.ALLOW_BENEFIT_ASOF;

    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockResolvedValue([
      {
        id: 'exact',
        title: 'Exact day',
        description: 'Only on birthday',
        brandId: 'brand1',
        validityType: 'birthday_exact_date',
        validityDuration: 1,
        redemptionMethod: 'in-store',
        isFree: true,
        promoCode: null,
        termsAndConditions: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        brand: {
          id: 'brand1',
          name: 'Test Brand',
          logoUrl: 'https://example.com/logo.png',
          website: 'https://example.com',
          category: 'food',
          actionUrl: null,
          actionType: null,
          actionLabel: null,
        },
      },
    ]);

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_BENEFIT_ASOF;
      setBenefitClock(new Date(2024, 0, 10, 12, 0, 0));

      const req = {
        nextUrl: {
          searchParams: new URLSearchParams('asOf=2024-06-15'),
        },
      } as unknown as import('next/server').NextRequest;

      const response = await GET(req);
      const data = await response.json();
      const evaluated = new Date(data.evaluatedAt);
      expect(evaluated.getFullYear()).toBe(2024);
      expect(evaluated.getMonth()).toBe(0);
      expect(evaluated.getDate()).toBe(10);
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      if (originalAllow === undefined) {
        delete process.env.ALLOW_BENEFIT_ASOF;
      } else {
        process.env.ALLOW_BENEFIT_ASOF = originalAllow;
      }
      resetBenefitClock();
    }
  });

  it('should evaluate without asOf using Asia/Jerusalem calendar day', async () => {
    const mockBenefits = [
      {
        id: 'exact',
        title: 'Exact day',
        description: 'Only on birthday',
        brandId: 'brand1',
        validityType: 'birthday_exact_date',
        validityDuration: 1,
        redemptionMethod: 'in-store',
        isFree: true,
        promoCode: null,
        termsAndConditions: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        brand: {
          id: 'brand1',
          name: 'Test Brand',
          logoUrl: 'https://example.com/logo.png',
          website: 'https://example.com',
          category: 'food',
          actionUrl: null,
          actionType: null,
          actionLabel: null,
        },
      },
    ];

    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockResolvedValue(mockBenefits);

    // UTC evening of Jun 14 = already Jun 15 in Asia/Jerusalem
    setBenefitClock(new Date(Date.UTC(2024, 5, 14, 22, 30, 0)));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timeZone).toBe('Asia/Jerusalem');
    const evaluated = new Date(data.evaluatedAt);
    expect(evaluated.getFullYear()).toBe(2024);
    expect(evaluated.getMonth()).toBe(5);
    expect(evaluated.getDate()).toBe(15);
    expect(data.benefits[0].windowStatus).toBe('active');
  });

  it('should honor allowlisted tz=UTC and ignore unknown tz', async () => {
    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockResolvedValue([]);

    setBenefitClock(new Date(Date.UTC(2024, 5, 14, 22, 30, 0)));

    const utcReq = {
      nextUrl: { searchParams: new URLSearchParams('tz=UTC') },
      headers: { get: () => null },
    } as unknown as import('next/server').NextRequest;

    const utcRes = await GET(utcReq);
    const utcData = await utcRes.json();
    expect(utcData.timeZone).toBe('UTC');
    const utcDay = new Date(utcData.evaluatedAt);
    expect(utcDay.getDate()).toBe(14);

    const badReq = {
      nextUrl: {
        searchParams: new URLSearchParams('tz=America/New_York'),
      },
      headers: { get: () => null },
    } as unknown as import('next/server').NextRequest;

    const badRes = await GET(badReq);
    const badData = await badRes.json();
    expect(badData.timeZone).toBe('Asia/Jerusalem');
    expect(new Date(badData.evaluatedAt).getDate()).toBe(15);
  });

  it('should mark exact-date benefit upcoming when asOf is far from DOB', async () => {
    const mockBenefits = [
      {
        id: 'exact',
        title: 'Exact day',
        description: 'Only on birthday',
        brandId: 'brand1',
        validityType: 'birthday_exact_date',
        validityDuration: 1,
        redemptionMethod: 'in-store',
        isFree: true,
        promoCode: null,
        termsAndConditions: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        brand: {
          id: 'brand1',
          name: 'Test Brand',
          logoUrl: 'https://example.com/logo.png',
          website: 'https://example.com',
          category: 'food',
          actionUrl: null,
          actionType: null,
          actionLabel: null,
        },
      },
    ];

    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockResolvedValue(mockBenefits);

    const req = {
      nextUrl: {
        searchParams: new URLSearchParams('asOf=2024-01-10'),
      },
    } as unknown as import('next/server').NextRequest;

    const response = await GET(req);
    const data = await response.json();

    expect(data.benefits[0].windowStatus).toBe('upcoming');
  });

  it('should return windowStatus none when user has no DOB', async () => {
    (getOrCreateUser as jest.Mock).mockResolvedValue({
      id: 'session-user-id',
      clerkId: 'user_test123',
      email: 'test@example.com',
      name: 'Test User',
      dateOfBirth: null,
    });

    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockResolvedValue([
      {
        id: '1',
        title: 'Birthday Discount',
        description: '10% off',
        brandId: 'brand1',
        validityType: 'birthday_exact_date',
        validityDuration: 1,
        redemptionMethod: 'in-store',
        isFree: true,
        promoCode: null,
        termsAndConditions: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        brand: {
          id: 'brand1',
          name: 'Test Brand',
          logoUrl: 'https://example.com/logo.png',
          website: 'https://example.com',
          category: 'food',
          actionUrl: null,
          actionType: null,
          actionLabel: null,
        },
      },
    ]);

    const response = await GET();
    const data = await response.json();
    expect(data.benefits[0].windowStatus).toBe('none');
  });

  it('should return 401 when not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValue({ userId: null });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });

    consoleSpy.mockRestore();
  });

  it('should handle user membership query errors', async () => {
    prisma.userMembership.findMany.mockRejectedValue(
      new Error('Membership query failed')
    );

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'internalServerError' });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching benefits:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it('should handle benefit query errors', async () => {
    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockRejectedValue(
      new Error('Benefit query failed')
    );

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const response = await GET();

    expect(response.status).toBe(500);
    consoleSpy.mockRestore();
  });

  it('should correctly transform benefits with all properties', async () => {
    const mockBenefits = [
      {
        id: 'benefit-id',
        title: 'Premium Benefit',
        description: 'Premium description',
        brandId: 'brand-id',
        validityType: 'birthday_entire_month',
        validityDuration: 30,
        redemptionMethod: 'code',
        isFree: false,
        promoCode: 'PREMIUM30',
        termsAndConditions: 'Premium terms',
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-02'),
        brand: {
          id: 'brand-id',
          name: 'Premium Brand',
          logoUrl: 'https://premium.com/logo.png',
          website: 'https://premium.com',
          category: 'premium',
          actionUrl: 'https://premium.com/action',
          actionType: 'internal',
          actionLabel: 'Activate',
        },
      },
    ];

    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockResolvedValue(mockBenefits);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    const benefit = data.benefits[0];

    expect(benefit).toEqual({
      id: 'benefit-id',
      title: 'Premium Benefit',
      description: 'Premium description',
      brandId: 'brand-id',
      brand: {
        name: 'Premium Brand',
        logoUrl: 'https://premium.com/logo.png',
        website: 'https://premium.com',
        category: 'premium',
        actionUrl: 'https://premium.com/action',
        actionType: 'internal',
        actionLabel: 'Activate',
      },
      promoCode: 'PREMIUM30',
      url: 'https://premium.com',
      validityType: 'birthday_entire_month',
      validityDuration: 30,
      redemptionMethod: 'code',
      termsAndConditions: 'Premium terms',
      isFree: false,
      createdAt: '2023-06-01T00:00:00.000Z',
      updatedAt: '2023-06-02T00:00:00.000Z',
      windowStatus: expect.stringMatching(/^(active|upcoming|none)$/),
    });
    expect(data.evaluatedAt).toBeDefined();
  });

  it('should call Prisma methods with correct parameters', async () => {
    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockResolvedValue([]);

    await GET();

    expect(prisma.userMembership.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'session-user-id',
        isActive: true,
      },
      include: {
        brand: {
          include: {
            benefits: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    expect(prisma.benefit.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
            category: true,
            actionUrl: true,
            actionType: true,
            actionLabel: true,
          },
        },
      },
    });
  });
});
