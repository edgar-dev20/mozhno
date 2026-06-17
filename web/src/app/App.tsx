import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MotionConfig } from 'motion/react';
import { Toaster } from '@/app/components/ui/sonner';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { LocaleProvider } from '@/i18n';
import { router } from '@/app/routes';
import { getErrorMessage, isAppError } from '@/shared/errorHandler';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) return;
      if (isAppError(error) && error.code === 'UNAUTHORIZED') return;
      toast.error(getErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isAppError(error) && error.code === 'UNAUTHORIZED') return;
      toast.error(getErrorMessage(error));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <LocaleProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <MotionConfig reducedMotion="user">
              <RouterProvider router={router} />
              <Toaster position="bottom-right" richColors />
            </MotionConfig>
          </QueryClientProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </LocaleProvider>
  );
}
