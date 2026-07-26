import type { SVGProps } from 'react';

export function EmptyAuditLogIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="12"
        y="8"
        width="40"
        height="48"
        rx="4"
        className="fill-muted-foreground/8 dark:fill-muted-foreground/5 stroke-muted-foreground/15 dark:stroke-muted-foreground/10"
        strokeWidth="1.25"
      />
      <rect
        x="20"
        y="18"
        width="16"
        height="2.5"
        rx="1.25"
        className="fill-muted-foreground/12 dark:fill-muted-foreground/8"
      />
      <rect
        x="20"
        y="26"
        width="22"
        height="2.5"
        rx="1.25"
        className="fill-muted-foreground/10 dark:fill-muted-foreground/6"
      />
      <rect
        x="20"
        y="34"
        width="14"
        height="2.5"
        rx="1.25"
        className="fill-muted-foreground/8 dark:fill-muted-foreground/5"
      />
      <path
        d="M20 44h8m-4-4v8"
        className="stroke-muted-foreground/10 dark:stroke-muted-foreground/6"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle
        cx="48"
        cy="16"
        r="3"
        className="fill-muted-foreground/10 dark:fill-muted-foreground/6 stroke-muted-foreground/15 dark:stroke-muted-foreground/10"
        strokeWidth="1"
      />
      <path
        d="M47 16l1-1m-1 2l1 1"
        className="stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
