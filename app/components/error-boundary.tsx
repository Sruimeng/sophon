import React from 'react';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import { Layout } from './layout';

const isDEV = import.meta.env.DEV;

/**
 * 静态回退错误页面 - 当 Router Context 不可用时使用
 * 不依赖任何 React Router hooks
 */
const FallbackErrorPage: React.FC<{ message?: string; stack?: string }> = ({
  message = 'Application Error',
  stack = '',
}) => {
  if (isDEV) {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-2xl text-red-500 font-bold">{message}</h1>
        {stack && (
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm dark:bg-gray-800">
            <code>{stack}</code>
          </pre>
        )}
        <button
          className="mt-4 rounded-lg bg-blue-500 px-6 py-2 text-white transition-opacity hover:opacity-80"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          Back to Home
        </button>
      </main>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-900 text-white">
      <div className="text-6xl">⚠️</div>
      <div className="text-xl">{message}</div>
      <button
        className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-opacity hover:opacity-80"
        onClick={() => {
          window.location.href = '/';
        }}
      >
        Back to Home
      </button>
    </div>
  );
};

/**
 * 内部错误边界组件 - 使用 Router hooks
 * 仅在 Router Context 可用时使用
 */
const RouterAwareErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  let message = 'Oops! This page is not found.';
  let stack = '';

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
    stack = error.stack || '';
  }

  if (isDEV) {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-2xl text-red-500 font-bold">{message}</h1>
        {stack && (
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm dark:bg-gray-800">
            <code>{stack}</code>
          </pre>
        )}
      </main>
    );
  } else {
    return (
      <Layout>
        <div className="h-screen flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">🔍</div>
          <div className="text-xl text-muted">{message}</div>
          <button
            className="rounded-lg bg-primary px-6 py-2 text-white transition-opacity hover:opacity-80"
            onClick={() => {
              navigate('/', { replace: true });
            }}
          >
            {t('backHome', 'Back to Home')}
          </button>
        </div>
      </Layout>
    );
  }
};

/**
 * React Class ErrorBoundary - 用于捕获子组件的渲染错误
 * 当 RouterAwareErrorBoundary 因 Context 问题失败时，回退到静态页面
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SafeErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || 'Application Error';
      const stack = this.state.error?.stack || '';
      return <FallbackErrorPage message={message} stack={stack} />;
    }

    return this.props.children;
  }
}

/**
 * 默认错误边界 - 带有 Context 安全检查
 * 使用 React Class ErrorBoundary 包裹，当 Router Context 不可用时回退到静态页面
 */
export const DefaultErrorBoundary: React.FC = () => {
  return (
    <SafeErrorBoundary>
      <RouterAwareErrorBoundary />
    </SafeErrorBoundary>
  );
};
