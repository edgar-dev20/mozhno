import { useRef, useEffect, useState } from 'react';

interface SparklineBucket {
  trueCount: number;
  falseCount: number;
}

interface FlagSparklineProps {
  data: SparklineBucket[];
  height?: number;
}

export function FlagSparkline({ data, height = 36 }: FlagSparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(100);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-muted-foreground" style={{ height }}>
        —
      </div>
    );
  }

  const maxVal = Math.max(1, ...data.map(d => d.trueCount + d.falseCount));
  const barWidth = Math.max(1, (width - (data.length - 1) * 1) / data.length);
  const gap = 1;

  return (
    <div ref={containerRef} style={{ height }} className="w-full">
      <svg width={width} height={height} className="block">
        {data.map((d, i) => {
          const x = i * (barWidth + gap);
          const totalH = ((d.trueCount + d.falseCount) / maxVal) * height;
          const trueH = totalH > 0 ? (d.trueCount / (d.trueCount + d.falseCount)) * totalH : 0;
          const falseH = totalH - trueH;
          const yTrue = height - totalH;
          const yFalse = yTrue + trueH;

          return (
            <g key={i}>
              {falseH > 0 && (
                <rect x={x} y={yFalse} width={barWidth} height={Math.max(0.5, falseH)} rx="1" style={{ fill: 'var(--color-gradient-start)', opacity: 0.3 }} />
              )}
              {trueH > 0 && (
                <rect x={x} y={yTrue} width={barWidth} height={Math.max(0.5, trueH)} rx="1" style={{ fill: 'var(--color-gradient-start)' }} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
