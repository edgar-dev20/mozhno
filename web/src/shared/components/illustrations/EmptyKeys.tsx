import type { SVGProps } from 'react';

export function EmptyKeysIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="24"
        cy="28"
        r="10"
        className="fill-muted-foreground/8 dark:fill-muted-foreground/5 stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1.25"
      />
      <path
        d="M20 26a4 4 0 108 0 4 4 0 00-8 0z"
        className="fill-muted-foreground/15 dark:fill-muted-foreground/10"
      />
      <path
        d="M22 28l1-1m-1 3a3 3 0 01-3 3h-2a1 1 0 01-1-1v-1a1 1 0 011-1h2a1 1 0 001-1"
        className="stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <rect
        x="34"
        y="22"
        width="20"
        height="8"
        rx="1.5"
        className="fill-muted-foreground/10 dark:fill-muted-foreground/6 stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1"
      />
      <rect
        x="34"
        y="36"
        width="16"
        height="8"
        rx="1.5"
        className="fill-muted-foreground/8 dark:fill-muted-foreground/5 stroke-muted-foreground/10 dark:stroke-muted-foreground/6"
        strokeWidth="1"
      />
      <rect
        x="34"
        y="50"
        width="12"
        height="8"
        rx="1.5"
        className="fill-muted-foreground/6 dark:fill-muted-foreground/4 stroke-muted-foreground/8 dark:stroke-muted-foreground/5"
        strokeWidth="1"
      />
    </svg>
  );
}
