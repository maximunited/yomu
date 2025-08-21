// Mock NextAuth first
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options
jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
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

import { GET } from "@/app/api/benefits/route";
import { getServerSession } from "next-auth";

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;

describe("/api/benefits", () => {
  const { prisma } = require("@/lib/prisma");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clear console mocks after each test
    jest.restoreAllMocks();
  });

  it("should return benefits list with authenticated user", async () => {
    const mockSession = { user: { id: "session-user-id" } };
    const mockMemberships = [
      {
        id: "membership1",
        userId: "session-user-id",
        brandId: "brand1",
        isActive: true,
        brand: {
          id: "brand1",
          name: "Test Brand",
          benefits: [
            {
              id: "benefit1",
              title: "Brand Benefit",
              isActive: true,
            },
          ],
        },
      },
    ];
    const mockBenefits = [
      {
        id: "1",
        title: "Birthday Discount",
        description: "10% off on birthday",
        brandId: "brand1",
        validityType: "birthday_exact_date",
        validityDuration: 1,
        redemptionMethod: "in-store",
        isFree: true,
        promoCode: "BIRTHDAY10",
        termsAndConditions: "Valid for 1 day",
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
        brand: {
          id: "brand1",
          name: "Test Brand",
          logoUrl: "https://example.com/logo.png",
          website: "https://example.com",
          category: "food",
          actionUrl: "https://action.example.com",
          actionType: "external",
          actionLabel: "Shop Now",
        },
      },
    ];

    mockGetServerSession.mockResolvedValue(mockSession);
    prisma.userMembership.findMany.mockResolvedValue(mockMemberships);
    prisma.benefit.findMany.mockResolvedValue(mockBenefits);

    // Spy on console.log to verify logging
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.benefits).toBeDefined();
    expect(data.memberships).toBe(1);
    expect(data.benefits).toHaveLength(1);

    const benefit = data.benefits[0];
    expect(benefit.title).toBe("Birthday Discount");
    expect(benefit.description).toBe("10% off on birthday");
    expect(benefit.promoCode).toBe("BIRTHDAY10");
    expect(benefit.url).toBe("https://example.com");
    expect(benefit.brand.name).toBe("Test Brand");
    expect(benefit.brand.actionUrl).toBe("https://action.example.com");

    expect(consoleSpy).toHaveBeenCalledWith(
      "=== Starting GET request to /api/benefits ===",
    );
    expect(consoleSpy).toHaveBeenCalledWith("Session:", "Found");

    consoleSpy.mockRestore();
  });

  it("should handle missing session and use test user", async () => {
    const mockUser = { id: "test-user-id" };
    const mockMemberships = [];
    const mockBenefits = [
      {
        id: "1",
        title: "Test Benefit",
        description: "Test Description",
        brandId: "brand1",
        validityType: null, // Test null validity type fallback
        validityDuration: null,
        redemptionMethod: "online",
        isFree: false,
        promoCode: null,
        termsAndConditions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        brand: {
          id: "brand1",
          name: "Test Brand",
          logoUrl: "https://example.com/logo.png",
          website: "https://example.com",
          category: "shopping",
          actionUrl: null,
          actionType: null,
          actionLabel: null,
        },
      },
    ];

    mockGetServerSession.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue(mockUser);
    prisma.userMembership.findMany.mockResolvedValue(mockMemberships);
    prisma.benefit.findMany.mockResolvedValue(mockBenefits);

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.benefits).toHaveLength(1);
    expect(data.benefits[0].validityType).toBe("birthday_month"); // Fallback value
    expect(data.memberships).toBe(0);

    expect(consoleSpy).toHaveBeenCalledWith("Session:", "Not found");
    expect(consoleSpy).toHaveBeenCalledWith(
      "No session user ID, using test user ID",
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Using test user ID:",
      "test-user-id",
    );

    consoleSpy.mockRestore();
  });

  it("should return 401 when no session and no users in database", async () => {
    mockGetServerSession.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue(null);

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      message: "unauthorized",
      error: "AUTHENTICATION_REQUIRED",
    });

    expect(consoleSpy).toHaveBeenCalledWith("No users found in database");
    consoleSpy.mockRestore();
  });

  it("should handle user membership query errors", async () => {
    const mockSession = { user: { id: "session-user-id" } };
    mockGetServerSession.mockResolvedValue(mockSession);
    prisma.userMembership.findMany.mockRejectedValue(
      new Error("Membership query failed"),
    );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ message: "internalServerError" });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching benefits:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("should handle benefit query errors", async () => {
    const mockSession = { user: { id: "session-user-id" } };
    mockGetServerSession.mockResolvedValue(mockSession);
    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockRejectedValue(
      new Error("Benefit query failed"),
    );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const response = await GET();

    expect(response.status).toBe(500);
    consoleSpy.mockRestore();
  });

  it("should correctly transform benefits with all properties", async () => {
    const mockSession = { user: { id: "session-user-id" } };
    const mockBenefits = [
      {
        id: "benefit-id",
        title: "Premium Benefit",
        description: "Premium description",
        brandId: "brand-id",
        validityType: "birthday_entire_month",
        validityDuration: 30,
        redemptionMethod: "code",
        isFree: false,
        promoCode: "PREMIUM30",
        termsAndConditions: "Premium terms",
        createdAt: new Date("2023-06-01"),
        updatedAt: new Date("2023-06-02"),
        brand: {
          id: "brand-id",
          name: "Premium Brand",
          logoUrl: "https://premium.com/logo.png",
          website: "https://premium.com",
          category: "premium",
          actionUrl: "https://premium.com/action",
          actionType: "internal",
          actionLabel: "Activate",
        },
      },
    ];

    mockGetServerSession.mockResolvedValue(mockSession);
    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockResolvedValue(mockBenefits);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    const benefit = data.benefits[0];

    expect(benefit).toEqual({
      id: "benefit-id",
      title: "Premium Benefit",
      description: "Premium description",
      brandId: "brand-id",
      brand: {
        name: "Premium Brand",
        logoUrl: "https://premium.com/logo.png",
        website: "https://premium.com",
        category: "premium",
        actionUrl: "https://premium.com/action",
        actionType: "internal",
        actionLabel: "Activate",
      },
      promoCode: "PREMIUM30",
      url: "https://premium.com",
      validityType: "birthday_entire_month",
      validityDuration: 30,
      redemptionMethod: "code",
      termsAndConditions: "Premium terms",
      isFree: false,
      createdAt: new Date("2023-06-01"),
      updatedAt: new Date("2023-06-02"),
    });
  });

  it("should call Prisma methods with correct parameters", async () => {
    const mockSession = { user: { id: "user-123" } };
    mockGetServerSession.mockResolvedValue(mockSession);
    prisma.userMembership.findMany.mockResolvedValue([]);
    prisma.benefit.findMany.mockResolvedValue([]);

    await GET();

    expect(prisma.userMembership.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-123",
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
