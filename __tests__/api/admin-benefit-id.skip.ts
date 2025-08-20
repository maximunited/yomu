import { getServerSession } from "next-auth";
import * as prismaClient from "@/lib/prisma";
import { PATCH, DELETE } from "@/app/api/admin/benefits/[id]/route";
import "@/lib/auth";

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    benefit: { update: jest.fn(), delete: jest.fn() },
    notification: { deleteMany: jest.fn() },
  },
}));

describe.skip("/api/admin/benefits/[id]", () => {
  beforeEach(() => {
    (getServerSession as unknown as jest.Mock).mockResolvedValue({
      user: { id: "u1" },
    } as any);
  });

  it("PATCH updates isActive", async () => {
    (prismaClient.prisma.benefit.update as jest.Mock).mockResolvedValueOnce({
      id: "b1",
      isActive: false,
    });
    const req = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ isActive: false }),
    } as any) as any;
    const res = await PATCH(req, { params: Promise.resolve({ id: "b1" }) });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toMatchObject({ id: "b1", isActive: false });
  });

  it("DELETE removes notifications and benefit", async () => {
    (
      prismaClient.prisma.notification.deleteMany as jest.Mock
    ).mockResolvedValueOnce({});
    (prismaClient.prisma.benefit.delete as jest.Mock).mockResolvedValueOnce({});
    const req = new Request("http://localhost", {
      method: "DELETE",
    } as any) as any;
    const res = await DELETE(req, { params: Promise.resolve({ id: "b2" }) });
    expect(res.status).toBe(200);
  });
});
