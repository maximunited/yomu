import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export type AdminAuthResult =
  { ok: true; userId: string } | { ok: false; response: NextResponse };

/**
 * Require a signed-in Clerk user with publicMetadata.role === 'admin',
 * or whose userId is listed in ADMIN_USER_IDS (comma-separated).
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const allowlist = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowlist.includes(userId)) {
    return { ok: true, userId };
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role;
    if (role === 'admin') {
      return { ok: true, userId };
    }
  } catch (error) {
    console.error('Admin auth lookup failed:', error);
  }

  return {
    ok: false,
    response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
  };
}
