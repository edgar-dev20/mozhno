import type { SVGProps } from 'react';

export function EmptySegmentsIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="20" cy="22" r="6" className="fill-muted-foreground/10 dark:fill-muted-foreground/6 stroke-muted-foreground/15 dark:stroke-muted-foreground/10" strokeWidth="1.25" />
      <circle cx="38" cy="28" r="5" className="fill-muted-foreground/10 dark:fill-muted-foreground/6 stroke-muted-foreground/15 dark:stroke-muted-foreground/10" strokeWidth="1.25" />
      <circle cx="44" cy="46" r="7" className="fill-muted-foreground/10 dark:fill-muted-foreground/6 stroke-muted-foreground/15 dark:stroke-muted-foreground/10" strokeWidth="1.25" />
      <path d="M20 28l14-3m-10 21l18-15" className="stroke-muted-foreground/10 dark:stroke-muted-foreground/6" strokeWidth="1" strokeLinecap="round" />
      <path d="M14 42l6-3m18-22l8 6" className="stroke-muted-foreground/8 dark:stroke-muted-foreground/4" strokeWidth="1" strokeLinecap="round" />
      <circle cx="14" cy="50" r="3" className="fill-muted-foreground/8 dark:fill-muted-foreground/5 stroke-muted-foreground/12 dark:stroke-muted-foreground/8" strokeWidth="1" />
    </svg>
  );
}
