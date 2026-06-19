import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SparklineBucket {
  trueCount: number;
  falseCount: number;
}

interface FlagSparklineProps {
  data: SparklineBucket[];
  height?: number;
}

export function FlagSparkline({ data, height = 56 }: FlagSparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(100);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-muted-foreground/40"
        style={{ height }}
      >
        —
      </div>
    );
  }

  const maxVal = Math.max(1, ...data.map((d) => d.trueCount + d.falseCount));
  const paddingX = 2;
  const effectiveWidth = width - paddingX * 2;
  const barWidth = Math.max(1, (effectiveWidth - (data.length - 1) * 1) / data.length);
  const gap = 1;
  const baselineY = height - 1;

  return (
    <div ref={containerRef} style={{ height, overflow: 'hidden' }} className="w-full">
      <motion.div
        initial={{ clipPath: 'inset(0 0 0 100%)' }}
        animate={{ clipPath: 'inset(0 0 0 0%)' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg
          width={width}
          height={height}
          className="block"
          role="img"
          aria-label="Sparkline chart"
        >
          {data.map((d, i) => {
            const x = paddingX + i * (barWidth + gap);
            const totalH = ((d.trueCount + d.falseCount) / maxVal) * (height - 2);
            const trueH = totalH > 0 ? (d.trueCount / (d.trueCount + d.falseCount)) * totalH : 0;
            const falseH = totalH - trueH;
            const yTrue = baselineY - totalH;
            const yFalse = yTrue + trueH;

            return (
              <g key={i}>
                {falseH > 0.5 && (
                  <motion.rect
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.02, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={{ originY: 1 }}
                    x={x}
                    y={yFalse}
                    width={barWidth}
                    height={Math.max(0.5, falseH)}
                    rx="1"
                    fill="var(--sparkline-false)"
                  />
                )}
                {trueH > 0.5 && (
                  <motion.rect
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.02 + 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ originY: 1 }}
                    x={x}
                    y={yTrue}
                    width={barWidth}
                    height={Math.max(0.5, trueH)}
                    rx="1"
                    fill="var(--sparkline-true)"
                  />
                )}
              </g>
            );
          })}
          <line
            x1="0"
            y1={height}
            x2={width}
            y2={height}
            stroke="var(--color-muted-foreground)"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        </svg>
      </motion.div>
    </div>
  );
}

export function SparklinePlaceholder({ height = 56 }: { height?: number }) {
  const colCount = 24;
  const heights = Array.from({ length: colCount }, (_, i) => {
    const t = i / (colCount - 1);
    return 0.18 + 0.4 * Math.sin(t * Math.PI);
  });

  return (
    <div className="w-full overflow-hidden" style={{ height }}>
      <motion.div
        initial={{ clipPath: 'inset(0 0 0 100%)' }}
        animate={{ clipPath: 'inset(0 0 0 0%)' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-end justify-center gap-px pb-1 animate-pulse h-full"
      >
        {heights.map((h, i) => (
          <div
            key={i}
            className="w-px rounded-t-[1px] bg-sparkline-true/6 dark:bg-sparkline-true/10"
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </motion.div>
    </div>
  );
}
