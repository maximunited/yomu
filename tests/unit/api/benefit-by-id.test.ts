import { GET } from '@/app/api/benefits/[id]/route';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    benefit: {
      findUnique: jest.fn(),
    },
  },
}));

describe('/api/benefits/[id]', () => {
  const { prisma } = require('@/lib/prisma');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return benefit details by ID', async () => {
    const mockBenefit = {
      id: 'benefit1',
      title: 'Birthday Discount',
      description: '10% off on birthday',
      validityType: 'birthday_exact_date',
      validityDuration: 1,
      redemptionMethod: 'online',
      termsAndConditions: 'Valid for 1 day',
      promoCode: 'BIRTHDAY10',
      brand: {
        id: 'brand1',
        name: 'Test Brand',
        logoUrl: 'https://example.com/logo.png',
        website: 'https://example.com',
        description: 'Test brand description',
        category: 'food',
      },
    };

    prisma.benefit.findUnique.mockResolvedValue(mockBenefit);

    const request = new NextRequest(
      'http://localhost:3000/api/benefits/benefit1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'benefit1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('benefit1');
    expect(data.title).toBe('Birthday Discount');
    expect(data.brand.name).toBe('Test Brand');
    expect(data.validityType).toBe('birthday_exact_date');
    expect(prisma.benefit.findUnique).toHaveBeenCalledWith({
      where: { id: 'benefit1' },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
            description: true,
            category: true,
          },
        },
      },
    });
  });

  it('should return 404 when benefit not found', async () => {
    prisma.benefit.findUnique.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/benefits/nonexistent'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'nonexistent' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe('benefitNotFound');
  });

  it('should handle database errors', async () => {
    prisma.benefit.findUnique.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest(
      'http://localhost:3000/api/benefits/benefit1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'benefit1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('internalServerError');
  });

  it('should transform benefit data correctly', async () => {
    const mockBenefit = {
      id: 'benefit1',
      title: 'Birthday Special',
      description: 'Free dessert',
      validityType: 'birthday_month',
      validityDuration: 30,
      redemptionMethod: 'in_store',
      termsAndConditions: 'Show ID',
      promoCode: null,
      brand: {
        id: 'brand1',
        name: 'Dessert Place',
        logoUrl: 'logo.png',
        website: 'https://dessertplace.com',
        description: 'Sweet treats',
        category: 'food',
      },
    };

    prisma.benefit.findUnique.mockResolvedValue(mockBenefit);

    const request = new NextRequest(
      'http://localhost:3000/api/benefits/benefit1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'benefit1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: 'benefit1',
      title: 'Birthday Special',
      description: 'Free dessert',
      brand: {
        name: 'Dessert Place',
        logoUrl: 'logo.png',
        website: 'https://dessertplace.com',
      },
      promoCode: null,
      url: 'https://dessertplace.com',
      validityType: 'birthday_month',
      validityDuration: 30,
      redemptionMethod: 'in_store',
      termsAndConditions: 'Show ID',
    });
  });

  it('should handle null validityType with fallback', async () => {
    const mockBenefit = {
      id: 'benefit2',
      title: 'Special Offer',
      description: 'Limited time offer',
      validityType: null, // Test fallback
      validityDuration: null,
      redemptionMethod: 'online',
      termsAndConditions: null,
      promoCode: 'SPECIAL20',
      brand: {
        id: 'brand2',
        name: 'Special Brand',
        logoUrl: 'special.png',
        website: 'https://special.com',
        description: 'Special brand',
        category: 'shopping',
      },
    };

    prisma.benefit.findUnique.mockResolvedValue(mockBenefit);

    const request = new NextRequest(
      'http://localhost:3000/api/benefits/benefit2'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'benefit2' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.validityType).toBe('birthday_month'); // Fallback value
    expect(data.promoCode).toBe('SPECIAL20');
  });

  it('should handle console error logging', async () => {
    const mockError = new Error('Database connection failed');
    prisma.benefit.findUnique.mockRejectedValue(mockError);

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const request = new NextRequest(
      'http://localhost:3000/api/benefits/benefit1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'benefit1' }),
    });

    expect(response.status).toBe(500);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching benefit:',
      mockError
    );

    consoleSpy.mockRestore();
  });

  it('should correctly extract ID from params', async () => {
    const mockBenefit = {
      id: 'special-id-123',
      title: 'Test',
      description: 'Test desc',
      validityType: 'birthday_exact_date',
      validityDuration: 1,
      redemptionMethod: 'code',
      termsAndConditions: 'Terms',
      promoCode: 'CODE123',
      brand: {
        id: 'brand1',
        name: 'Test Brand',
        logoUrl: 'test.png',
        website: 'https://test.com',
        description: 'Test brand',
        category: 'test',
      },
    };

    prisma.benefit.findUnique.mockResolvedValue(mockBenefit);

    const request = new NextRequest(
      'http://localhost:3000/api/benefits/special-id-123'
    );
    await GET(request, {
      params: Promise.resolve({ id: 'special-id-123' }),
    });

    expect(prisma.benefit.findUnique).toHaveBeenCalledWith({
      where: { id: 'special-id-123' },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
            description: true,
            category: true,
          },
        },
      },
    });
  });

  it('should include all brand fields in transformation', async () => {
    const mockBenefit = {
      id: 'benefit1',
      title: 'Complete Benefit',
      description: 'All fields present',
      validityType: 'birthday_weekend',
      validityDuration: 3,
      redemptionMethod: 'app',
      termsAndConditions: 'Complete terms',
      promoCode: 'COMPLETE',
      brand: {
        id: 'complete-brand',
        name: 'Complete Brand',
        logoUrl: 'https://complete.com/logo.png',
        website: 'https://complete.com',
        description: 'Complete brand description',
        category: 'complete',
      },
    };

    prisma.benefit.findUnique.mockResolvedValue(mockBenefit);

    const request = new NextRequest(
      'http://localhost:3000/api/benefits/benefit1'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'benefit1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.brand).toEqual({
      name: 'Complete Brand',
      logoUrl: 'https://complete.com/logo.png',
      website: 'https://complete.com',
    });
    expect(data.url).toBe('https://complete.com'); // url should match brand.website
  });
});
