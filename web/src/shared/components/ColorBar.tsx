import { adjustColor } from '@/shared/color';

interface ColorBarProps {
  color: string;
  label?: string;
}

export function ColorBar({ color, label }: ColorBarProps) {
  return (
    <>
      <div
        className="h-1.5"
        aria-hidden={!label}
        role={label ? 'img' : undefined}
        aria-label={label}
        style={{
          background: `linear-gradient(to right, ${color}, ${adjustColor(color, 40)})`,
        }}
      />
    </>
  );
}
