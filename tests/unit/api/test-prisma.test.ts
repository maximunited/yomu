import { NextRequest } from "next/server";
import { GET } from "@/app/api/test-prisma/route";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    brand: {
      count: jest.fn(),
    },
  },
}));

// Mock NextRequest
const createMockRequest = () => {
  return new NextRequest("http://localhost:3000/api/test-prisma");
};

describe("/api/test-prisma", () => {
  const mockPrisma = require("@/lib/prisma").prisma;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return success response when database connection works", async () => {
    mockPrisma.brand.count.mockResolvedValue(5);

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      message: "prismaConnectionSuccess",
      brandCount: 5,
    });
    expect(mockPrisma.brand.count).toHaveBeenCalledTimes(1);
  });

  it("should return error response when database connection fails", async () => {
    const mockError = new Error("Database connection failed");
    mockPrisma.brand.count.mockRejectedValue(mockError);

    // Spy on console.error to verify error logging
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      message: "prismaConnectionFailed",
      error: "Database connection failed",
    });
    expect(mockPrisma.brand.count).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("Prisma test error:", mockError);

    consoleSpy.mockRestore();
  });

  it("should handle non-Error exceptions", async () => {
    mockPrisma.brand.count.mockRejectedValue("String error");

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      message: "prismaConnectionFailed",
      error: "Unknown error",
    });

    consoleSpy.mockRestore();
  });

  it("should handle zero brand count", async () => {
    mockPrisma.brand.count.mockResolvedValue(0);

    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      message: "prismaConnectionSuccess",
      brandCount: 0,
    });
  });
});
