import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Public routes (no Clerk session required).
 * Dangerous admin/seed/setup/test routes must NOT appear here —
 * they rely on auth.protect() + requireAdmin().
 */
export const PUBLIC_ROUTES = [
  '/',
  '/about(.*)',
  '/terms(.*)',
  '/privacy(.*)',
  '/contact(.*)',
  '/demo(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  // Cron is public to Clerk; each /api/cron/* route must gate itself
  // (GET: CRON_SECRET only; POST may allow requireAdmin for manual runs).
  '/api/cron(.*)',
  '/api/benefits(.*)',
  '/api/brands(.*)',
  '/api/push/vapid-public-key',
] as const;

const isPublicRoute = createRouteMatcher([...PUBLIC_ROUTES]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
