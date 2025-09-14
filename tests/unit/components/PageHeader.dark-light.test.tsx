import { render } from '@testing-library/react';
import PageHeader from '@/components/PageHeader';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('PageHeader dark/light mode', () => {
  it('renders under both providers', () => {
    render(
      <DarkModeProvider>
        <LanguageProvider>
          <PageHeader title="T" />
        </LanguageProvider>
      </DarkModeProvider>
    );
  });
});
