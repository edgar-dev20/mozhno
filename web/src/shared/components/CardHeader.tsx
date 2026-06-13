import React from 'react';

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, meta, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-4 pt-3.5 pb-3 ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-body font-semibold tracking-tight leading-tight text-foreground/85">
          {title}
        </h3>
        {meta && (
          <span className="text-xs font-medium shrink-0 text-muted-foreground/50">{meta}</span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground/60 mt-0.5">{subtitle}</p>}
    </div>
  );
}
