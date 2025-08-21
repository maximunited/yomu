import { GET, POST } from "@/app/api/user/memberships/route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

// Mock NextAuth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
    userMembership: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
    },
    brand: {
      findUnique: jest.fn(),
    },
    customMembership: {
      create: jest.fn(),
    },
  },
}));

// Mock auth options
jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

describe("/api/user/memberships", () => {
  const { prisma } = require("@/lib/prisma");
  const mockGetServerSession = getServerSession as jest.MockedFunction<
    typeof getServerSession
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return user memberships when authenticated", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user1" },
      } as any);

      const mockBrandMemberships = [
        {
          id: "mem1",
          brandId: "brand1",
          isActive: true,
          brand: { id: "brand1", name: "Test Brand", logoUrl: "logo.png" },
        },
      ];

      const mockCustomMemberships = [
        {
          id: "custom1",
          customMembershipId: "custom1",
          isActive: true,
          customMembership: {
            id: "custom1",
            name: "Custom Brand",
            icon: "icon.png",
            description: "Custom description",
            category: "food",
            type: "free",
            cost: null,
          },
        },
      ];

      prisma.userMembership.findMany
        .mockResolvedValueOnce(mockBrandMemberships)
        .mockResolvedValueOnce(mockCustomMemberships);

      const request = new NextRequest(
        "http://localhost:3000/api/user/memberships",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.memberships).toHaveLength(2);
      expect(prisma.userMembership.findMany).toHaveBeenCalledTimes(2);
    });

    it("should handle unauthenticated user with test fallback", async () => {
      mockGetServerSession.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue({ id: "testuser" });

      const mockMemberships: any[] = [];
      prisma.userMembership.findMany.mockResolvedValue(mockMemberships);

      const request = new NextRequest(
        "http://localhost:3000/api/user/memberships",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.memberships).toEqual([]);
    });

    it("should return 401 when no session and no test user", async () => {
      mockGetServerSession.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/user/memberships",
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe("POST", () => {
    it("should create brand memberships", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user1" },
      } as any);

      const mockBrand = {
        id: "brand1",
        name: "Test Brand",
        partnershipsFrom: [],
        partnershipsTo: [],
      };

      prisma.brand.findUnique.mockResolvedValue(mockBrand);
      prisma.userMembership.updateMany.mockResolvedValue({ count: 0 });
      prisma.userMembership.upsert.mockResolvedValue({
        id: "mem1",
        userId: "user1",
        brandId: "brand1",
        isActive: true,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/user/memberships",
        {
          method: "POST",
          body: JSON.stringify({
            brandIds: ["brand1"],
            customMemberships: [],
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("changesSavedSuccessfully");
      expect(prisma.userMembership.updateMany).toHaveBeenCalled();
      expect(prisma.userMembership.upsert).toHaveBeenCalled();
    });

    it("should create custom memberships", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user1" },
      } as any);

      const mockCustomMembership = {
        id: "custom1",
        name: "Custom Brand",
        description: "Custom description",
        category: "food",
      };

      prisma.userMembership.updateMany.mockResolvedValue({ count: 0 });
      prisma.customMembership.create.mockResolvedValue(mockCustomMembership);
      prisma.userMembership.create.mockResolvedValue({
        id: "mem1",
        userId: "user1",
        customMembershipId: "custom1",
        isActive: true,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/user/memberships",
        {
          method: "POST",
          body: JSON.stringify({
            brandIds: [],
            customMemberships: [mockCustomMembership],
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("changesSavedSuccessfully");
      expect(prisma.customMembership.create).toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user1" },
      } as any);

      prisma.userMembership.updateMany.mockRejectedValue(
        new Error("Database error"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/user/memberships",
        {
          method: "POST",
          body: JSON.stringify({
            brandIds: ["brand1"],
            customMemberships: [],
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
