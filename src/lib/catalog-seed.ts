import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const seedModule = require('../../scripts/seed.js') as {
  seed: (options?: { mode?: string; brands?: string }) => Promise<{
    mode: string;
    brandsCreated: number;
    benefitsProcessed: number;
  }>;
  predefinedBrands: unknown[];
};

export const seed = seedModule.seed;
export const predefinedBrands = seedModule.predefinedBrands;
