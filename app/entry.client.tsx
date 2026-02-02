import { I18nConfig, resources } from '@/locales';
import i18next from '@/locales/lib/i18next';
import { I18nextProvider, initReactI18next } from '@/locales/lib/react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

// 懒加载路由组件
const Index = lazy(() => import('./routes/_index'));
const Visualize = lazy(() => import('./routes/visualize'));
const NotFound = lazy(() => import('./routes/404/route'));

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian-100 text-text-primary">
      <div className="text-2xl">Loading...</div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <Index />
      </Suspense>
    ),
  },
  {
    path: '/visualize',
    element: (
      <Suspense fallback={<Loading />}>
        <Visualize />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<Loading />}>
        <NotFound />
      </Suspense>
    ),
  },
]);

async function main() {
  console.log('[entry.client] Starting...');

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

    console.log('[entry.client] i18n initialized, rendering...');

    if (!document.getElementById('root')) {
      document.body.innerHTML = '<div id="root"></div>';
    }

    const root = createRoot(document.getElementById('root')!);

    root.render(
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <RouterProvider router={router} />
        </StrictMode>
      </I18nextProvider>,
    );

    console.log('[entry.client] Render complete');
  } catch (error) {
    console.error('[entry.client] Failed:', error);
  }
}

main().catch((err) => console.error('[entry.client] Fatal error:', err));
