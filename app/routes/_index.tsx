import { useTranslation } from 'react-i18next';

export default function Index() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="mb-4 text-4xl font-bold">React Router v7 Template</h1>
      <p className="text-lg text-muted">{t('welcome', 'Welcome to your new app!')}</p>
      <div className="mt-8 flex gap-4">
        <a
          href="https://reactrouter.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-primary px-4 py-2 text-white transition-opacity hover:opacity-80"
        >
          React Router Docs
        </a>
        <a
          href="https://unocss.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-secondary px-4 py-2 text-white transition-opacity hover:opacity-80"
        >
          UnoCSS Docs
        </a>
      </div>
    </div>
  );
}
