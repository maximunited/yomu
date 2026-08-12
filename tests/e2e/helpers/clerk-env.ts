import fs from 'fs';
import path from 'path';

/**
 * Load .env.local for Playwright workers and map Clerk key names
 * expected by @clerk/testing.
 */
export function loadClerkE2EEnv(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require('dotenv') as typeof import('dotenv');
    const envLocal = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocal)) {
      dotenv.config({ path: envLocal, quiet: true });
    }
    const envFile = path.join(process.cwd(), '.env');
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile, quiet: true });
    }
  } catch {
    // dotenv optional if env already injected by CI
  }

  if (
    !process.env.CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ) {
    process.env.CLERK_PUBLISHABLE_KEY =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  }
}
