import React from 'react';
import { AlertCircle } from "@/shared/icons";

interface ErrorBoxProps {
  children: React.ReactNode;
  className?: string;
}

export function ErrorBox({ children, className = '' }: ErrorBoxProps) {
  return (
    <div className={`p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-sm text-destructive ${className}`}>
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}
