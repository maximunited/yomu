import type { Config } from '@prisma/client';

const config: Config = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/yomu',
    },
  },
};

export default config;
