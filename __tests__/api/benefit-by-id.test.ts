import { GET } from "@/app/api/benefits/[id]/route";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    benefit: {
      findUnique: jest.fn(),
    },
  },
}));

describe("/api/benefits/[id]", () => {
  const { prisma } = require("@/lib/prisma");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return benefit details by ID", async () => {
    const mockBenefit = {
      id: "benefit1",
      title: "Birthday Discount",
      description: "10% off on birthday",
      validityType: "birthday_exact_date",
      validityDuration: 1,
      redemptionMethod: "online",
      termsAndConditions: "Valid for 1 day",
      promoCode: "BIRTHDAY10",
      brand: {
        id: "brand1",
        name: "Test Brand",
        logoUrl: "https://example.com/logo.png",
        website: "https://example.com",
        description: "Test brand description",
        category: "food",
      },
    };

    prisma.benefit.findUnique.mockResolvedValue(mockBenefit);

    const request = new NextRequest(
      "http://localhost:3000/api/benefits/benefit1",
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "benefit1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("benefit1");
    expect(data.title).toBe("Birthday Discount");
    expect(data.brand.name).toBe("Test Brand");
    expect(data.validityType).toBe("birthday_exact_date");
    expect(prisma.benefit.findUnique).toHaveBeenCalledWith({
      where: { id: "benefit1" },
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

  it("should return 404 when benefit not found", async () => {
    prisma.benefit.findUnique.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/benefits/nonexistent",
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("benefitNotFound");
  });

  it("should handle database errors", async () => {
    prisma.benefit.findUnique.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest(
      "http://localhost:3000/api/benefits/benefit1",
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "benefit1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("internalServerError");
  });

  it("should transform benefit data correctly", async () => {
    const mockBenefit = {
      id: "benefit1",
      title: "Birthday Special",
      description: "Free dessert",
      validityType: "birthday_month",
      validityDuration: 30,
      redemptionMethod: "in_store",
      termsAndConditions: "Show ID",
      promoCode: null,
      brand: {
        id: "brand1",
        name: "Dessert Place",
        logoUrl: "logo.png",
        website: "https://dessertplace.com",
        description: "Sweet treats",
        category: "food",
      },
    };

    prisma.benefit.findUnique.mockResolvedValue(mockBenefit);

    const request = new NextRequest(
      "http://localhost:3000/api/benefits/benefit1",
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "benefit1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: "benefit1",
      title: "Birthday Special",
      description: "Free dessert",
      brand: {
        name: "Dessert Place",
        logoUrl: "logo.png",
        website: "https://dessertplace.com",
      },
      promoCode: null,
      url: "https://dessertplace.com",
      validityType: "birthday_month",
      validityDuration: 30,
      redemptionMethod: "in_store",
      termsAndConditions: "Show ID",
    });
  });
});
