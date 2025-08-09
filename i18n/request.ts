import {getRequestConfig} from 'next-intl/server';
import {translations} from '@/lib/translations';

const supportedLocales = ['he', 'en'] as const;
type Supported = typeof supportedLocales[number];
const isSupported = (l: unknown): l is Supported => typeof l === 'string' && (supportedLocales as readonly string[]).includes(l);

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale: Supported = isSupported(requested) ? requested : 'he';
  return {
    locale,
    messages: translations[locale] as unknown as Record<string, unknown>
  };
});


