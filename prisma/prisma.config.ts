import type { Config } from '@prisma/client';

const config: Config = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
};

export default config;
