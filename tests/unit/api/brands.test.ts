import { GET } from '@/app/api/brands/route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    brand: {
      findMany: jest.fn(),
    },
  },
}));

describe('/api/brands', () => {
  const { prisma } = require('@/lib/prisma');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return transformed brands with partnerships', async () => {
    const mockBrands = [
      {
        id: 'brand1',
        name: 'Brand A',
        isActive: true,
        logoUrl: 'https://example.com/logo1.png',
        category: 'food',
        description: 'Test brand A',
        website: 'https://branda.com',
        actionUrl: null,
        actionType: null,
        actionLabel: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        partnershipsFrom: [
          {
            brandB: {
              id: 'brand2',
              name: 'Brand B',
              isActive: true,
              logoUrl: 'https://example.com/logo2.png',
              category: 'shopping',
              description: 'Test brand B',
              website: 'https://brandb.com',
              actionUrl: null,
              actionType: null,
              actionLabel: null,
              createdAt: new Date('2023-01-02'),
              updatedAt: new Date('2023-01-02'),
            },
          },
        ],
        partnershipsTo: [
          {
            brandA: {
              id: 'brand3',
              name: 'Brand C',
              isActive: true,
              logoUrl: 'https://example.com/logo3.png',
              category: 'entertainment',
              description: 'Test brand C',
              website: 'https://brandc.com',
              actionUrl: null,
              actionType: null,
              actionLabel: null,
              createdAt: new Date('2023-01-03'),
              updatedAt: new Date('2023-01-03'),
            },
          },
        ],
      },
    ];

    prisma.brand.findMany.mockResolvedValue(mockBrands);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);

    const transformedBrand = data[0];
    expect(transformedBrand.id).toBe('brand1');
    expect(transformedBrand.name).toBe('Brand A');
    expect(transformedBrand.partnerBrands).toHaveLength(2);
    expect(transformedBrand.childBrands).toHaveLength(2); // Backward compatibility
    expect(transformedBrand.parentBrand).toBeNull(); // Backward compatibility

    // Check partner brands include both from partnershipsFrom and partnershipsTo
    const partnerIds = transformedBrand.partnerBrands.map((p: any) => p.id);
    expect(partnerIds).toContain('brand2');
    expect(partnerIds).toContain('brand3');

    expect(prisma.brand.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
      include: {
        partnershipsFrom: {
          include: {
            brandB: true,
          },
        },
        partnershipsTo: {
          include: {
            brandA: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  });

  it('should filter out inactive partner brands', async () => {
    const mockBrands = [
      {
        id: 'brand1',
        name: 'Brand A',
        isActive: true,
        logoUrl: 'https://example.com/logo1.png',
        category: 'food',
        description: 'Test brand A',
        website: 'https://branda.com',
        actionUrl: null,
        actionType: null,
        actionLabel: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        partnershipsFrom: [
          {
            brandB: {
              id: 'brand2',
              name: 'Inactive Brand',
              isActive: false, // Inactive brand
              logoUrl: 'https://example.com/logo2.png',
              category: 'shopping',
              description: 'Inactive brand',
              website: 'https://inactive.com',
              actionUrl: null,
              actionType: null,
              actionLabel: null,
              createdAt: new Date('2023-01-02'),
              updatedAt: new Date('2023-01-02'),
            },
          },
        ],
        partnershipsTo: [],
      },
    ];

    prisma.brand.findMany.mockResolvedValue(mockBrands);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    const transformedBrand = data[0];
    expect(transformedBrand.partnerBrands).toHaveLength(0); // Inactive brand filtered out
  });

  it('should handle brands with no partnerships', async () => {
    const mockBrands = [
      {
        id: 'brand1',
        name: 'Standalone Brand',
        isActive: true,
        logoUrl: 'https://example.com/logo1.png',
        category: 'food',
        description: 'Standalone brand',
        website: 'https://standalone.com',
        actionUrl: null,
        actionType: null,
        actionLabel: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        partnershipsFrom: [],
        partnershipsTo: [],
      },
    ];

    prisma.brand.findMany.mockResolvedValue(mockBrands);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    const transformedBrand = data[0];
    expect(transformedBrand.partnerBrands).toHaveLength(0);
    expect(transformedBrand.childBrands).toHaveLength(0);
  });

  it('should return empty array when no brands found', async () => {
    prisma.brand.findMany.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it('should return error response when database query fails', async () => {
    const mockError = new Error('Database connection failed');
    prisma.brand.findMany.mockRejectedValue(mockError);

    // Spy on console.error to verify error logging
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      message: 'internalServerError',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching brands:',
      mockError
    );

    consoleSpy.mockRestore();
  });

  it('should handle null brandB or brandA in partnerships', async () => {
    const mockBrands = [
      {
        id: 'brand1',
        name: 'Brand A',
        isActive: true,
        logoUrl: 'https://example.com/logo1.png',
        category: 'food',
        description: 'Test brand A',
        website: 'https://branda.com',
        actionUrl: null,
        actionType: null,
        actionLabel: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        partnershipsFrom: [
          {
            brandB: null, // Null brandB
          },
        ],
        partnershipsTo: [
          {
            brandA: null, // Null brandA
          },
        ],
      },
    ];

    prisma.brand.findMany.mockResolvedValue(mockBrands);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    const transformedBrand = data[0];
    expect(transformedBrand.partnerBrands).toHaveLength(0); // No partners due to null values
  });
});
