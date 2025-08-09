import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale
});

export const config = {
  // Skip API routes, static files and Next.js internals
  matcher: ['/((?!api|_next|.*\..*).*)']
};


