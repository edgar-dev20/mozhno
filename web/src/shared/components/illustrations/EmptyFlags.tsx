import type { SVGProps } from 'react';

export function EmptyFlagsIllustration(props: SVGProps<SVGSVGElement>) {
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
        y="10"
        width="2.5"
        height="44"
        rx="1.25"
        className="fill-muted-foreground/20 dark:fill-muted-foreground/12"
      />
      <path
        d="M14.5 10h24l-3.5 6 3.5 6h-24V10z"
        className="fill-muted-foreground/12 dark:fill-muted-foreground/8"
      />
      <circle cx="44" cy="22" r="1.5" className="fill-muted-foreground/15" />
      <circle cx="50" cy="26" r="1" className="fill-muted-foreground/10" />
      <circle cx="56" cy="20" r="1.5" className="fill-muted-foreground/18" />
      <path
        d="M44 32l8-8"
        className="stroke-muted-foreground/15"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M52 48v-5l4-4h3l4 4v5l-3 2"
        className="stroke-muted-foreground/12"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
