import { authOptions } from '@/lib/auth'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(async (pw: string, hash: string) => pw === hash),
}))

describe('authOptions', () => {
  it('has expected structure', () => {
    expect(authOptions.providers.length).toBeGreaterThan(0)
    expect(authOptions.session?.strategy).toBe('jwt')
    expect(authOptions.pages?.signIn).toBe('/auth/signin')
  })

  it('authorize returns null for missing credentials', async () => {
    const credsProvider: any = authOptions.providers.find((p: any) => p.name === 'credentials')
    await expect(credsProvider.authorize(undefined)).resolves.toBeNull()
  })

  it('authorize returns null for unknown user', async () => {
    const { prisma } = require('@/lib/prisma')
    prisma.user.findUnique.mockResolvedValue(null)
    const credsProvider: any = authOptions.providers.find((p: any) => p.name === 'credentials')
    await expect(credsProvider.authorize({ email: 'a@b.com', password: 'x' })).resolves.toBeNull()
  })

  it('authorize returns user for valid credentials', async () => {
    const { prisma } = require('@/lib/prisma')
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'A', password: 'good' })
    const credsProvider: any = authOptions.providers.find((p: any) => p.name === 'credentials')
    const user = await credsProvider.authorize({ email: 'a@b.com', password: 'good' })
    expect(user).toMatchObject({ id: 'u1', email: 'a@b.com', name: 'A' })
  })

  it('jwt callback injects user fields', async () => {
    const token = await (authOptions.callbacks as any).jwt({ token: {}, user: { id: '1', email: 'e', name: 'n' } })
    expect(token).toMatchObject({ id: '1', email: 'e', name: 'n' })
  })

  it('session callback copies token fields into session.user', async () => {
    const session = await (authOptions.callbacks as any).session({ session: { user: {} }, token: { id: '1', email: 'e', name: 'n' } })
    expect(session.user).toMatchObject({ id: '1', email: 'e', name: 'n' })
  })
})


