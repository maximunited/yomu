import { render, screen, fireEvent } from '@testing-library/react'
import AdminForm from '@/components/AdminForm'

describe('AdminForm', () => {
  it('renders brand form and submits controlled values', async () => {
    const onSave = jest.fn()
    const onCancel = jest.fn()

    render(
      <AdminForm
        type="brand"
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Brand' } })
    fireEvent.change(screen.getByLabelText('Logo URL'), { target: { value: '/images/brands/test.png' } })
    fireEvent.change(screen.getByLabelText('Website'), { target: { value: 'https://example.com' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Brand description' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'food' } })

    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(onSave).toHaveBeenCalled()
    const payload = onSave.mock.calls[0][0]
    expect(payload).toMatchObject({
      name: 'Test Brand',
      logoUrl: '/images/brands/test.png',
      website: 'https://example.com',
      description: 'Brand description',
      category: 'food',
      isActive: true,
    })
  })

  it('renders benefit form and toggles checkbox/number inputs', async () => {
    const onSave = jest.fn()

    render(
      <AdminForm
        type="benefit"
        brands={[{ id: 'b1', name: 'Brand 1', logoUrl: '', website: '', description: '', category: 'food', isActive: true }]}
        onSave={onSave}
        onCancel={() => {}}
      />
    )

    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'b1' } })
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Free Coffee' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Get a free coffee' } })
    fireEvent.change(screen.getByLabelText('Redemption Method'), { target: { value: 'Show app' } })
    fireEvent.change(screen.getByLabelText('Validity Type'), { target: { value: 'birthday' } })
    fireEvent.change(screen.getByLabelText('Validity Duration (days)'), { target: { value: '30' } })
    fireEvent.click(screen.getByLabelText('Free benefit'))

    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(onSave).toHaveBeenCalled()
    const payload = onSave.mock.calls[0][0]
    expect(payload).toMatchObject({
      brandId: 'b1',
      title: 'Free Coffee',
      description: 'Get a free coffee',
      redemptionMethod: 'Show app',
      validityType: 'birthday',
      validityDuration: 30,
    })
  })

  it('renders edit mode with prefilled values and submits update', async () => {
    const onSave = jest.fn()
    const item = {
      id: 'b1',
      name: 'Brand X',
      logoUrl: '/x.png',
      website: 'https://x.com',
      description: 'Desc',
      category: 'food',
      isActive: true,
    }
    render(
      <AdminForm
        type="brand"
        item={item as any}
        onSave={onSave}
        onCancel={() => {}}
      />
    )
    // submit without changes
    fireEvent.click(screen.getByRole('button', { name: /update/i }))
    expect(onSave).toHaveBeenCalled()
  })
})


