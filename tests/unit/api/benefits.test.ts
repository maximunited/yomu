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
    benefit: {
      findMany: jest.fn(),
    },
  },
}));

import { GET } from "@/app/api/benefits/route";
import { NextRequest } from "next/server";

describe("/api/benefits", () => {
  const { prisma } = require("@/lib/prisma");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return benefits list", async () => {
    const mockBenefits = [
      {
        id: "1",
        title: "Birthday Discount",
        description: "10% off on birthday",
        validityType: "birthday_exact_date",
        brand: {
          name: "Test Brand",
          logoUrl: "https://example.com/logo.png",
        },
      },
    ];

    prisma.benefit.findMany.mockResolvedValue(mockBenefits);

    const request = new NextRequest("http://localhost:3000/api/benefits");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockBenefits);
    expect(prisma.benefit.findMany).toHaveBeenCalledWith({
      include: { brand: true },
    });
  });

  it("should handle database errors", async () => {
    prisma.benefit.findMany.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/benefits");
    const response = await GET(request);

    expect(response.status).toBe(500);
  });

  it("should filter benefits by brand if brandId provided", async () => {
    const mockBenefits = [
      {
        id: "1",
        title: "Birthday Discount",
        brandId: "brand1",
      },
    ];

    prisma.benefit.findMany.mockResolvedValue(mockBenefits);

    const request = new NextRequest(
      "http://localhost:3000/api/benefits?brandId=brand1",
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(prisma.benefit.findMany).toHaveBeenCalledWith({
      where: { brandId: "brand1" },
      include: { brand: true },
    });
  });
});
