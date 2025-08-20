import { GET } from "@/app/api/brands/route";
import { NextRequest } from "next/server";

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

    const request = new NextRequest("http://localhost:3000/api/brands");
    const response = await GET(request);
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

    const request = new NextRequest("http://localhost:3000/api/brands");
    const response = await GET(request);

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

    const request = new NextRequest(
      "http://localhost:3000/api/brands?category=food",
    );
    const response = await GET(request);

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
