describe('proxy config', () => {
  it('exports a default middleware function', () => {
    jest.resetModules();

    const proxyModule = require('../../../src/proxy');
    expect(proxyModule.default).toBeDefined();
    expect(typeof proxyModule.default).toBe('function');
  });

  it('exports a matcher config', () => {
    jest.resetModules();

    const proxyModule = require('../../../src/proxy');
    expect(proxyModule.config).toBeDefined();
    expect(proxyModule.config.matcher).toBeDefined();
    expect(Array.isArray(proxyModule.config.matcher)).toBe(true);
  });

  it('exports PUBLIC_ROUTES for allowlist contracts', () => {
    jest.resetModules();

    const proxyModule = require('../../../src/proxy');
    expect(Array.isArray(proxyModule.PUBLIC_ROUTES)).toBe(true);
    expect(proxyModule.PUBLIC_ROUTES).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/seed|setup|test-prisma|test-users|admin/),
      ])
    );
  });
});
