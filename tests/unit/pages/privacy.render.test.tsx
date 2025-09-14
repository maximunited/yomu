import { render, screen } from '../../utils/test-helpers';
import PrivacyPage from '@/app/privacy/page';

describe('PrivacyPage (render)', () => {
  it('renders privacy sections', () => {
    render(<PrivacyPage />);
    const privacyElements = screen.getAllByText(/פרטיות/i);
    expect(privacyElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/זכויות המשתמש/i)).toBeInTheDocument();
  });
});
