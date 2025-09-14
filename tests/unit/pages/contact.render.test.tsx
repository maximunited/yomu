import { render, screen } from '../../utils/test-helpers';
import ContactPage from '@/app/contact/page';

describe('ContactPage (render)', () => {
  it('renders contact page', () => {
    render(<ContactPage />);
    const contactElements = screen.getAllByText(/צור קשר/i);
    expect(contactElements.length).toBeGreaterThan(0);
  });
});
