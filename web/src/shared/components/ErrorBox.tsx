import React from 'react';
import { AlertCircle } from "@/shared/icons";

interface ErrorBoxProps {
  children: React.ReactNode;
  className?: string;
}

export function ErrorBox({ children, className = '' }: ErrorBoxProps) {
  return (
    <div className={`p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-2 text-sm text-red-700 dark:text-red-400 ${className}`}>
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}
