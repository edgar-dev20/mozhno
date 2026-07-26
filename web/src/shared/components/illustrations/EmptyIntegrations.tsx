import type { SVGProps } from 'react';

export function EmptyIntegrationsIllustration(props: SVGProps<SVGSVGElement>) {
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
        x="8"
        y="14"
        width="18"
        height="14"
        rx="3"
        className="fill-muted-foreground/10 dark:fill-muted-foreground/6 stroke-muted-foreground/15 dark:stroke-muted-foreground/10"
        strokeWidth="1.25"
      />
      <circle cx="14" cy="20" r="2" className="fill-muted-foreground/15 dark:fill-muted-foreground/10" />
      <rect x="13" y="22" width="8" height="2" rx="1" className="fill-muted-foreground/12 dark:fill-muted-foreground/8" />
      <rect
        x="38"
        y="36"
        width="18"
        height="14"
        rx="3"
        className="fill-muted-foreground/8 dark:fill-muted-foreground/5 stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1.25"
      />
      <circle cx="44" cy="42" r="2" className="fill-muted-foreground/12 dark:fill-muted-foreground/8" />
      <rect x="43" y="44" width="8" height="2" rx="1" className="fill-muted-foreground/10 dark:fill-muted-foreground/6" />
      <path
        d="M26 21l12 15"
        className="stroke-muted-foreground/10 dark:stroke-muted-foreground/6"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeDasharray="3 2"
      />
      <path
        d="M24 28l14-7m0 7l-14-7"
        className="stroke-muted-foreground/8 dark:stroke-muted-foreground/5"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="28" cy="12" r="3" className="fill-muted-foreground/12 dark:fill-muted-foreground/8 stroke-muted-foreground/15 dark:stroke-muted-foreground/10" strokeWidth="1" />
      <path
        d="M27 12l1-1m-1 3l1 1"
        className="stroke-muted-foreground/10 dark:stroke-muted-foreground/6"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
