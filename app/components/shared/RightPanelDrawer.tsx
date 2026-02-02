import { type ReactNode } from 'react';

interface RightPanelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function RightPanelDrawer({ isOpen, onClose, children }: RightPanelDrawerProps) {
  return (
    <>
      <aside className="hidden lg:flex lg:fixed lg:right-4 lg:top-4 lg:bottom-20 lg:w-80 lg:flex-col lg:gap-3 lg:z-10 lg:overflow-y-auto">
        {children}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <aside className="absolute right-0 top-0 h-full w-80 bg-[var(--color-bg)] flex flex-col gap-3 p-4 overflow-y-auto shadow-2xl">
            <button
              onClick={onClose}
              className="self-end rounded-lg bg-[var(--color-bg-secondary)] px-3 py-1.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-colors"
            >
              ✕
            </button>
            {children}
          </aside>
        </div>
      )}
    </>
  );
}
