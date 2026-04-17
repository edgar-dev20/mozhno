import { Suspense } from 'react';
import { PageErrorBoundary } from '@/app/components/PageErrorBoundary';
import { PageLoader } from '@/shared/components/PageLoader';

export function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType<object>> }) {
  return (
    <PageErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </PageErrorBoundary>
  );
}
