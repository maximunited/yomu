describe('proxy config', () => {
  it('exports a default middleware function', () => {
    jest.resetModules();

    const proxyModule = require('../../../proxy');
    expect(proxyModule.default).toBeDefined();
    expect(typeof proxyModule.default).toBe('function');
  });

  it('exports a matcher config', () => {
    jest.resetModules();

    const proxyModule = require('../../../proxy');
    expect(proxyModule.config).toBeDefined();
    expect(proxyModule.config.matcher).toBeDefined();
    expect(Array.isArray(proxyModule.config.matcher)).toBe(true);
  });
});
