import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * Lightweight admin probe for the client UI.
 * Mirrors server-side requireAdmin (role metadata + ADMIN_USER_IDS)
 * without exposing the allowlist.
 */
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  return NextResponse.json({ ok: true });
}
