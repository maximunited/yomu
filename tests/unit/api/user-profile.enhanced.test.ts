import { PUT, GET } from "@/app/api/user/profile/route";
import { NextRequest } from "next/server";

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock auth options
jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

describe("/api/user/profile Enhanced Tests", () => {
  const mockGetServerSession = require("next-auth").getServerSession;
  const { prisma } = require("@/lib/prisma");

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.log for tests
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("PUT /api/user/profile", () => {
    it("should update profile with valid session", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-123", email: "test@example.com" },
      });

      prisma.user.update.mockResolvedValue({
        id: "user-123",
        name: "Updated Name",
        email: "test@example.com",
        dateOfBirth: new Date("1990-01-01"),
        anniversaryDate: null,
        profilePicture: null,
      });

      const requestBody = {
        name: "Updated Name",
        dateOfBirth: "1990-01-01",
        anniversaryDate: null,
        profilePicture: null,
      };

      const request = new NextRequest(
        "http://localhost:3000/api/user/profile",
        {
          method: "PUT",
          body: JSON.stringify(requestBody),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.name).toBe("Updated Name");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          name: "Updated Name",
          dateOfBirth: new Date("1990-01-01"),
          anniversaryDate: null,
          profilePicture: null,
        },
      });
    });

    it("should handle anniversary date correctly", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      prisma.user.update.mockResolvedValue({
        id: "user-123",
        name: "Test User",
        anniversaryDate: new Date("2020-06-15"),
      });

      const requestBody = {
        name: "Test User",
        dateOfBirth: "1990-01-01",
        anniversaryDate: "2020-06-15",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/user/profile",
        {
          method: "PUT",
          body: JSON.stringify(requestBody),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          name: "Test User",
          dateOfBirth: new Date("1990-01-01"),
          anniversaryDate: new Date("2020-06-15"),
          profilePicture: undefined,
        },
      });
    });

    it("should use test user when session is missing", async () => {
      mockGetServerSession.mockResolvedValue(null);

      prisma.user.findFirst.mockResolvedValue({
        id: "test-user-123",
        email: "test@example.com",
      });

      prisma.user.update.mockResolvedValue({
        id: "test-user-123",
        name: "Test User",
      });

      const requestBody = {
        name: "Test User",
        dateOfBirth: "1990-01-01",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/user/profile",
        {
          method: "PUT",
          body: JSON.stringify(requestBody),
        },
      );

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(prisma.user.findFirst).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "test-user-123" },
        data: expect.any(Object),
      });
    });

    it("should return 401 when no session and no test user", async () => {
      mockGetServerSession.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/user/profile",
        {
          method: "PUT",
          body: JSON.stringify({ name: "Test" }),
        },
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe("unauthorized");
      expect(data.error).toBe("AUTHENTICATION_REQUIRED");
    });

    it("should handle database errors gracefully", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      prisma.user.update.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/user/profile",
        {
          method: "PUT",
          body: JSON.stringify({ name: "Test User" }),
        },
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("internalServerError");
    });

    it("should handle invalid JSON in request body", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/user/profile",
        {
          method: "PUT",
          body: "invalid json",
        },
      );

      const response = await PUT(request);

      expect(response.status).toBe(500);
    });

    it("should handle profile picture updates", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      prisma.user.update.mockResolvedValue({
        id: "user-123",
        name: "Test User",
        profilePicture: "base64-image-data",
      });

      const requestBody = {
        name: "Test User",
        profilePicture: "base64-image-data",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/user/profile",
        {
          method: "PUT",
          body: JSON.stringify(requestBody),
        },
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: expect.objectContaining({
          profilePicture: "base64-image-data",
        }),
      });
    });
  });

  describe("GET /api/user/profile", () => {
    it("should return user profile with valid session", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-123" },
      });

      prisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        dateOfBirth: new Date("1990-01-01"),
        anniversaryDate: null,
        profilePicture: null,
      });

      const request = new NextRequest("http://localhost:3000/api/user/profile");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.name).toBe("Test User");
      expect(data.user.email).toBe("test@example.com");
    });

    it("should use test user when session is missing", async () => {
      mockGetServerSession.mockResolvedValue(null);

      prisma.user.findFirst.mockResolvedValue({
        id: "test-user-123",
      });

      prisma.user.findUnique.mockResolvedValue({
        id: "test-user-123",
        name: "Test User",
        email: "test@example.com",
      });

      const request = new NextRequest("http://localhost:3000/api/user/profile");
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.user.findFirst).toHaveBeenCalled();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "test-user-123" },
        select: expect.any(Object),
      });
    });

    it("should handle user not found", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "nonexistent-user" },
      });

      prisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/user/profile");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe("userNotFound");
    });
  });
});
