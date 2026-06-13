import React, { useId } from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  maxLength?: number;
  value?: string;
}

export function FormField({ label, children, hint, maxLength, value }: FormFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground/80 flex items-center justify-between">
        <span>{label}</span>
        {maxLength !== undefined && value !== undefined && (
          <span className="text-xs font-normal text-muted-foreground/50 tabular-nums">{value.length}/{maxLength}</span>
        )}
      </label>
      {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<{ id?: string }>, { id }) : children}
      {hint && <p className="text-xs text-muted-foreground pl-1">{hint}</p>}
    </div>
  );
}
