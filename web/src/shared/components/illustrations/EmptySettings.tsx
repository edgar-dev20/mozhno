import type { SVGProps } from 'react';

export function EmptySettingsIllustration(props: SVGProps<SVGSVGElement>) {
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
        cx="32"
        cy="32"
        r="12"
        className="fill-muted-foreground/6 dark:fill-muted-foreground/4 stroke-muted-foreground/15 dark:stroke-muted-foreground/10"
        strokeWidth="1.25"
      />
      <path
        d="M32 20v4m0 24v-4"
        className="stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M20 32h-4m36 0h-4"
        className="stroke-muted-foreground/12 dark:stroke-muted-foreground/8"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="44" cy="20" r="4" className="fill-muted-foreground/8 dark:fill-muted-foreground/5 stroke-muted-foreground/12 dark:stroke-muted-foreground/8" strokeWidth="1.25" />
      <circle cx="20" cy="46" r="4" className="fill-muted-foreground/8 dark:fill-muted-foreground/5 stroke-muted-foreground/12 dark:stroke-muted-foreground/8" strokeWidth="1.25" />
      <circle cx="44" cy="46" r="3" className="fill-muted-foreground/10 dark:fill-muted-foreground/6 stroke-muted-foreground/12 dark:stroke-muted-foreground/8" strokeWidth="1.25" />
      <path
        d="M32 44l7-7m-14-7l-6 6"
        className="stroke-muted-foreground/10 dark:stroke-muted-foreground/6"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="18" cy="18" r="2" className="fill-muted-foreground/15 dark:fill-muted-foreground/10" />
      <circle cx="48" cy="50" r="2" className="fill-muted-foreground/12 dark:fill-muted-foreground/8" />
    </svg>
  );
}
