import { Component } from 'react';
import { AlertTriangle } from "@/shared/icons";
import { GradientButton } from "@/shared";
import { t } from "@/i18n";

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback to replace the default error view */
  fallback?: React.ReactNode;
}

interface PageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  state: PageErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('PageErrorBoundary caught:', error.message, info.componentStack);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="bg-card rounded-xl px-8 py-12 text-center shadow-md">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <div>
        <p className="text-sm font-semibold text-foreground">{t('errors.pageError')}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              {this.state.error?.message ?? t('errors.unknownError')}
            </p>
          </div>
          <GradientButton onClick={this.handleRetry}>
            {t('common.retry')}
            </GradientButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
