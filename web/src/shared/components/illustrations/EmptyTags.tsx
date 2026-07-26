import type { SVGProps } from 'react';

export function EmptyTagsIllustration(props: SVGProps<SVGSVGElement>) {
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
        x="10"
        y="14"
        width="20"
        height="12"
        rx="3"
        className="fill-muted-foreground/10 dark:fill-muted-foreground/6 stroke-muted-foreground/15 dark:stroke-muted-foreground/10"
        strokeWidth="1.25"
      />
      <circle
        cx="25"
        cy="20"
        r="2"
        className="fill-muted-foreground/15 dark:fill-muted-foreground/10"
      />
      <rect
        x="10"
        y="36"
        width="16"
        height="12"
        rx="3"
        className="fill-muted-foreground/8 dark:fill-muted-foreground/5 stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1.25"
      />
      <circle
        cx="22"
        cy="42"
        r="2"
        className="fill-muted-foreground/12 dark:fill-muted-foreground/8"
      />
      <path
        d="M38 20l6 6m-3-6v10"
        className="stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M30 30l-20 4"
        className="stroke-muted-foreground/8 dark:stroke-muted-foreground/5"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle
        cx="44"
        cy="44"
        r="8"
        className="fill-muted-foreground/6 dark:fill-muted-foreground/4 stroke-muted-foreground/10 dark:stroke-muted-foreground/6"
        strokeWidth="1.25"
        strokeDasharray="3 2"
      />
    </svg>
  );
}
