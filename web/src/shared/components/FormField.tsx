import React, { useId } from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  maxLength?: number;
  value?: string;
}

export function FormField({ label, children, hint, error, maxLength, value }: FormFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedByIds = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const childProps: Record<string, string | boolean | undefined> = { id };
  if (describedByIds) {
    childProps['aria-describedby'] = describedByIds;
  }
  if (error) {
    childProps['aria-invalid'] = true;
  }

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground/80 flex items-center justify-between"
      >
        <span>{label}</span>
        {maxLength !== undefined && value !== undefined && (
          <span className="text-xs font-normal text-muted-foreground/70 dark:text-muted-foreground tabular-nums">
            {value.length}/{maxLength}
          </span>
        )}
      </label>
  {React.isValidElement(children)
    ? React.cloneElement(
        children as React.ReactElement<{
          id?: string;
          'aria-describedby'?: string;
          'aria-invalid'?: boolean;
        }>,
        childProps,
      )
    : children}
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground pl-1">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive pl-1">
          {error}
        </p>
      )}
    </div>
  );
}
