import { render } from '@testing-library/react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

describe('LanguageSwitcher (wrapper component)', () => {
  it('renders without crashing', () => {
    render(<LanguageSwitcher />);
  });
});
