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

describe("/api/benefits", () => {
  const { prisma } = require("@/lib/prisma");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return benefits list", async () => {
    const mockUser = { id: "testuser" };
    const mockMemberships = [];
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
        promoCode: null,
        termsAndConditions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        brand: {
          id: "brand1",
          name: "Test Brand",
          logoUrl: "https://example.com/logo.png",
          website: "https://example.com",
          category: "food",
          actionUrl: null,
          actionType: null,
          actionLabel: null,
        },
      },
    ];

    prisma.user.findFirst.mockResolvedValue(mockUser);
    prisma.userMembership.findMany.mockResolvedValue(mockMemberships);
    prisma.benefit.findMany.mockResolvedValue(mockBenefits);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.benefits).toBeDefined();
    expect(data.memberships).toBe(0);
    expect(data.benefits).toHaveLength(1);
    expect(data.benefits[0].title).toBe("Birthday Discount");
  });

  it("should handle database errors", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: "testuser" });
    prisma.userMembership.findMany.mockRejectedValue(
      new Error("Database error"),
    );

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("should return 401 when no user found", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
  });
});
