import type { SVGProps } from 'react';

export function EmptyUsersIllustration(props: SVGProps<SVGSVGElement>) {
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
        cx="22"
        cy="20"
        r="5"
        className="fill-muted-foreground/10 dark:fill-muted-foreground/6 stroke-muted-foreground/15 dark:stroke-muted-foreground/10"
        strokeWidth="1.25"
      />
      <path
        d="M13 36c0-3 4-6 9-6s9 3 9 6"
        className="fill-muted-foreground/8 dark:fill-muted-foreground/5 stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="44"
        cy="24"
        r="4"
        className="fill-muted-foreground/8 dark:fill-muted-foreground/5 stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1.25"
      />
      <path
        d="M37 38c0-2.5 3-5 7-5s7 2.5 7 5"
        className="fill-muted-foreground/6 dark:fill-muted-foreground/4 stroke-muted-foreground/10 dark:stroke-muted-foreground/6"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="10"
        cy="50"
        r="4"
        className="fill-muted-foreground/6 dark:fill-muted-foreground/4 stroke-muted-foreground/10 dark:stroke-muted-foreground/6"
        strokeWidth="1"
      />
      <path
        d="M27 50l8-3m5-6l8 3"
        className="stroke-muted-foreground/10 dark:stroke-muted-foreground/6"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M18 54v2m-2-1h4"
        className="stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
