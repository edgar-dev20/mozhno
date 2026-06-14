import { adjustColor } from "@/shared/color";

interface ColorBarProps {
  color: string;
}

export function ColorBar({ color }: ColorBarProps) {
  return (
    <div
      className="h-1.5"
      aria-hidden="true"
      style={{
        background: `linear-gradient(to right, ${color}, ${adjustColor(color, 40)})`,
      }}
    />
  );
}
