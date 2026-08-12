/**
 * Contract tests for requireAdmin() — 401 unauthenticated, 403 non-admin,
 * allow via ADMIN_USER_IDS or publicMetadata.role === 'admin'.
 */
/* eslint-disable @typescript-eslint/no-require-imports */

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  clerkClient: jest.fn(),
}));

describe('requireAdmin', () => {
  const originalAdminIds = process.env.ADMIN_USER_IDS;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.ADMIN_USER_IDS;
  });

  afterAll(() => {
    if (originalAdminIds === undefined) {
      delete process.env.ADMIN_USER_IDS;
    } else {
      process.env.ADMIN_USER_IDS = originalAdminIds;
    }
  });

  function load() {
    const clerk = require('@clerk/nextjs/server');
    const { requireAdmin } = require('@/lib/admin-auth');
    return { ...clerk, requireAdmin };
  }

  it('returns 401 when unauthenticated', async () => {
    const { auth, clerkClient, requireAdmin } = load();
    auth.mockResolvedValue({ userId: null });

    const result = await requireAdmin();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      await expect(result.response.json()).resolves.toEqual({
        error: 'Unauthorized',
      });
    }
    expect(clerkClient).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated but not admin', async () => {
    const { auth, clerkClient, requireAdmin } = load();
    auth.mockResolvedValue({ userId: 'user_regular' });
    clerkClient.mockResolvedValue({
      users: {
        getUser: jest.fn().mockResolvedValue({
          publicMetadata: { role: 'member' },
        }),
      },
    });

    const result = await requireAdmin();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
      await expect(result.response.json()).resolves.toEqual({
        error: 'Forbidden',
      });
    }
  });

  it('allows user listed in ADMIN_USER_IDS without Clerk role lookup', async () => {
    process.env.ADMIN_USER_IDS = 'user_allow, user_other';
    const { auth, clerkClient, requireAdmin } = load();
    auth.mockResolvedValue({ userId: 'user_allow' });

    const result = await requireAdmin();

    expect(result).toEqual({ ok: true, userId: 'user_allow' });
    expect(clerkClient).not.toHaveBeenCalled();
  });

  it('allows user with publicMetadata.role === admin', async () => {
    const { auth, clerkClient, requireAdmin } = load();
    auth.mockResolvedValue({ userId: 'user_admin' });
    clerkClient.mockResolvedValue({
      users: {
        getUser: jest.fn().mockResolvedValue({
          publicMetadata: { role: 'admin' },
        }),
      },
    });

    const result = await requireAdmin();

    expect(result).toEqual({ ok: true, userId: 'user_admin' });
  });

  it('returns 403 when Clerk lookup fails', async () => {
    const { auth, clerkClient, requireAdmin } = load();
    auth.mockResolvedValue({ userId: 'user_broken' });
    clerkClient.mockResolvedValue({
      users: {
        getUser: jest.fn().mockRejectedValue(new Error('Clerk down')),
      },
    });
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const result = await requireAdmin();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
    }
    consoleSpy.mockRestore();
  });
});
