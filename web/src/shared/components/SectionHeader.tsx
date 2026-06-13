import React from 'react';

interface SectionHeaderProps {
  title: string;
  description: React.ReactNode;
  gradientClass?: string;
}

export function SectionHeader({ title, description, gradientClass }: SectionHeaderProps) {
  const gradient = gradientClass ?? 'from-gradient-start to-gradient-end';

  return (
    <div className="mb-8">
      <h1 className="font-bold tracking-tight">
        <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {title}
        </span>
      </h1>
      <div className="flex items-center gap-2 mt-3.5">
        <div className={`flex-shrink-0 w-1 h-1 rounded-full bg-gradient-to-b ${gradient}`} />
        <p className="text-body text-muted-foreground/80 leading-body">{description}</p>
      </div>
    </div>
  );
}
