import { getServerSession } from 'next-auth'
import * as prismaClient from '@/lib/prisma'
import { GET as GET_LIST, POST } from '@/app/api/admin/benefits/route'
import '@/lib/auth' // ensure module can be imported in handlers

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/prisma', () => ({ prisma: { benefit: { findMany: jest.fn(), create: jest.fn() } } }))

describe('/api/admin/benefits', () => {
  beforeEach(() => {
    (getServerSession as unknown as jest.Mock).mockResolvedValue({ user: { id: 'u1' } } as any)
  })

  it('GET returns all benefits', async () => {
    ;(prismaClient.prisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([{ id: 'x1' }])
    const res = await GET_LIST(new Request('http://localhost') as any)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toEqual([{ id: 'x1' }])
  })

  it('POST creates a benefit', async () => {
    ;(prismaClient.prisma.benefit.create as jest.Mock).mockResolvedValueOnce({ id: 'new1' })
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ brandId: 'b1', title: 'T', description: 'D', redemptionMethod: 'M', validityType: 'birthday', isFree: true, isActive: true }),
    } as any) as any
    const res = await POST(req)
    const json = await res.json()
    expect(res.status).toBe(201)
    expect(json).toEqual({ id: 'new1' })
  })
})


