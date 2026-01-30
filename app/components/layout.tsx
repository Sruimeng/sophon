import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

interface Props {
  children?: React.ReactNode;
}

/**
 * Simple Header component for the template
 */
const Header: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto h-full max-w-7xl flex items-center justify-between px-4">
        <Link
          to="/"
          className="text-xl text-foreground font-bold transition-opacity hover:opacity-80"
        >
          {t('appName', 'React Template')}
        </Link>
        <nav className="flex items-center gap-4">
          <a
            href="https://reactrouter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Docs
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
};

export const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Header />
      <main className="pt-14">{children}</main>
    </>
  );
};
