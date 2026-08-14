import React from 'react';
import { AlertTriangle } from '@/shared/icons';
import { GradientButton } from '@/shared';
import { t } from '@/i18n';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={28} className="text-destructive" />
            </div>
            <h1 className="text-h2 font-semibold text-foreground mb-2">
              {t('errors.somethingWentWrong')}
            </h1>
            <p className="text-body-sm text-muted-foreground mb-6">
              {this.state.error?.message ?? t('errors.unknownError')}
            </p>
            <GradientButton onClick={() => window.location.reload()}>
              {t('common.reload')}
            </GradientButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
