import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple middleware that just passes through requests
  // Language switching is now handled client-side by LanguageContext
  return NextResponse.next();
}

export const config = {
  // Skip API routes, static files and Next.js internals
  matcher: ['/((?!api|_next|.*..*).*)'],
};
