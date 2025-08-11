describe('middleware config', () => {
  it('creates middleware with locales and defaultLocale', () => {
    jest.resetModules()
    const createMw = jest.fn(() => jest.fn())
    jest.mock('next-intl/middleware', () => ({ __esModule: true, default: createMw }))
    jest.mock('next-intl/server', () => ({ getRequestConfig: (factory: any) => factory }))

    const { locales, defaultLocale } = require('../../i18n')
    // Load the middleware module after mocking dependency
    const mw = require('../../middleware').default
    expect(typeof mw).toBe('function')
    expect(createMw).toHaveBeenCalledWith({ locales, defaultLocale })
  })
})


