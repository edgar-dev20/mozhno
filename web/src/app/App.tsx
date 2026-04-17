import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/app/components/ui/sonner";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { LocaleProvider } from "@/i18n";
import { router } from "@/app/routes";

const queryClient = new QueryClient({
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
            <RouterProvider router={router} />
            <Toaster position="bottom-right" richColors />
          </QueryClientProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </LocaleProvider>
  );
}
