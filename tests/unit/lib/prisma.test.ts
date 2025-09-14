describe('prisma singleton module', () => {
  const originalEnvObj = process.env;

  afterEach(() => {
    jest.resetModules();
    // restore original env object
    Object.defineProperty(process, 'env', { value: originalEnvObj });
    // cleanup global cached instance if our real module set it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).prisma = undefined;
  });

  it('reuses a single PrismaClient instance in non-production', () => {
    Object.defineProperty(process, 'env', {
      value: { ...originalEnvObj, NODE_ENV: 'test' },
    });

    let created = 0;
    jest.doMock('@prisma/client', () => ({
      PrismaClient: function MockClient(this: any) {
        created += 1;
      },
    }));

    // First import
    let instance1: unknown;
    jest.isolateModules(() => {
      // import using relative path to bypass global jest mock of '@/lib/prisma'
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      instance1 = require('../../../src/lib/prisma').prisma;
    });

    // Second import should reuse the same instance (no new constructor call)
    let instance2: unknown;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      instance2 = require('../../../src/lib/prisma').prisma;
    });

    expect(created).toBe(1);
    expect(instance1).toBe(instance2);
  });

  it('does not cache globally in production', () => {
    Object.defineProperty(process, 'env', {
      value: { ...originalEnvObj, NODE_ENV: 'production' },
    });

    let created = 0;
    jest.doMock('@prisma/client', () => ({
      PrismaClient: function MockClient(this: any) {
        created += 1;
      },
    }));

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../../src/lib/prisma');
    });
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../../src/lib/prisma');
    });

    expect(created).toBe(2);
  });
});
