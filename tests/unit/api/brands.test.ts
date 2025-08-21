import { GET } from "@/app/api/brands/route";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    brand: {
      findMany: jest.fn(),
    },
  },
}));

describe("/api/brands", () => {
  const { prisma } = require("@/lib/prisma");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return active brands list", async () => {
    const mockBrands = [
      {
        id: "1",
        name: "Test Brand",
        logoUrl: "https://example.com/logo.png",
        category: "food",
        isActive: true,
      },
    ];

    prisma.brand.findMany.mockResolvedValue(mockBrands);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockBrands);
    expect(prisma.brand.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  });

  it("should handle database errors", async () => {
    prisma.brand.findMany.mockRejectedValue(new Error("Database error"));

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it("should filter brands by category if provided", async () => {
    const mockBrands = [
      {
        id: "1",
        name: "Food Brand",
        category: "food",
        isActive: true,
      },
    ];

    prisma.brand.findMany.mockResolvedValue(mockBrands);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(prisma.brand.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        category: "food",
      },
      orderBy: { name: "asc" },
    });
  });
});
