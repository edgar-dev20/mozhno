import type { SVGProps } from 'react';

export function EmptyConstraintsIllustration(props: SVGProps<SVGSVGElement>) {
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
        x="16"
        y="14"
        width="32"
        height="36"
        rx="4"
        className="fill-muted-foreground/8 dark:fill-muted-foreground/5 stroke-muted-foreground/15 dark:stroke-muted-foreground/10"
        strokeWidth="1.25"
      />
      <rect
        x="22"
        y="22"
        width="10"
        height="2.5"
        rx="1.25"
        className="fill-muted-foreground/12 dark:fill-muted-foreground/8"
      />
      <rect
        x="22"
        y="30"
        width="14"
        height="2.5"
        rx="1.25"
        className="fill-muted-foreground/10 dark:fill-muted-foreground/6"
      />
      <rect
        x="22"
        y="38"
        width="8"
        height="2.5"
        rx="1.25"
        className="fill-muted-foreground/8 dark:fill-muted-foreground/5"
      />
      <path
        d="M10 22l6-6m0 6l-6-6"
        className="stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M54 40l-6 6m0-6l6 6"
        className="stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M10 46l6-6"
        className="stroke-muted-foreground/10 dark:stroke-muted-foreground/6"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
