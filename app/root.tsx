import { useTheme } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import 'virtual:uno.css';
import { Canonical, DefaultErrorBoundary } from './components';
import './root.css';

export const links = () => {
  return [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
    },
  ];
};

export function HydrateFallback() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <Links />
        <title>Loading...</title>
      </head>
      <body className="select-none">
        <div className="flex min-h-screen items-center justify-center bg-obsidian-100 text-text-primary">
          <div className="text-2xl">Loading...</div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [theme] = useTheme();

  return (
    <html lang={i18n.language} dir={i18n.dir(i18n.language)} data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <Links />
        <Canonical />
      </head>
      <body className="select-none">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

export const ErrorBoundary: React.FC = () => {
  return <DefaultErrorBoundary />;
};

export default App;
