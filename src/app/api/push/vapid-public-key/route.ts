import { NextResponse } from 'next/server';
import { getVapidPublicKey } from '@/lib/notification-channels';

export const dynamic = 'force-dynamic';

export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ publicKey: null }, { status: 503 });
  }
  return NextResponse.json({ publicKey });
}
