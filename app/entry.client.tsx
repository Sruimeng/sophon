import { I18nConfig, resources } from '@/locales';
import i18next from '@/locales/lib/i18next';
import { I18nextProvider, initReactI18next } from '@/locales/lib/react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

async function main() {
  console.log('[entry.client] Starting hydration...');

  try {
    await i18next
      .use(initReactI18next)
      .use(LanguageDetector)
      .init({
        ...I18nConfig,
        resources,
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
        },
      });

    console.log('[entry.client] i18n initialized, hydrating...');

    startTransition(() => {
      hydrateRoot(
        document,
        <I18nextProvider i18n={i18next}>
          <StrictMode>
            <HydratedRouter />
          </StrictMode>
        </I18nextProvider>,
      );
    });

    console.log('[entry.client] Hydration complete');
  } catch (error) {
    console.error('[entry.client] Hydration failed:', error);
  }
}

main().catch((err) => console.error('[entry.client] Fatal error:', err));
