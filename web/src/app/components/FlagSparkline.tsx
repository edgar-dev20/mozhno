import { useRef, useEffect, useState, useMemo, memo } from 'react';
import { aggregateHourPairs } from '@/shared/sparklineAggregation';
import { motion } from 'motion/react';
import { useT } from '@/i18n';

interface SparklineBucket {
  trueCount: number;
  falseCount: number;
}

interface FlagSparklineProps {
  data: SparklineBucket[];
  height?: number;
}

export const FlagSparkline = memo(function FlagSparkline({ data, height = 56 }: FlagSparklineProps) {
  const t = useT();
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

  const displayData = useMemo(() => aggregateHourPairs(data), [data]);
  const maxVal = Math.max(1, ...displayData.map((d) => d.trueCount + d.falseCount));
  const hasTrue = displayData.some((d) => d.trueCount > 0);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-caption text-muted-foreground/70 dark:text-muted-foreground"
        style={{ height }}
      >
        —
    </div>
  );
  }

  const paddingX = 3;
  const effectiveWidth = width - paddingX * 2;
  const barWidth = Math.max(1, (effectiveWidth - (displayData.length - 1) * 1) / displayData.length);
  const gap = barWidth < 3 ? 0.5 : 1;
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
          aria-label={t('flags.metrics.chartTitle')}
        >
          {displayData.map((d, i) => {
            const x = paddingX + i * (barWidth + gap);
            const totalH = ((d.trueCount + d.falseCount) / maxVal) * (height - 2);
            const trueH = totalH > 0 ? (d.trueCount / (d.trueCount + d.falseCount)) * totalH : 0;
            const falseH = totalH - trueH;
            const yTrue = baselineY - totalH;
            const yFalse = yTrue + trueH;

            return (
              <g key={i}>
                {falseH > 0.5 && (
                  hasTrue ? (
                    <motion.rect
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.02, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      style={{ originY: 1 }}
                      x={x}
                      y={yFalse}
                      width={barWidth}
                      height={Math.max(0.5, falseH)}
                      fill="var(--sparkline-false)"
                    />
                  ) : (() => {
                    const r = Math.min(2, barWidth * 0.35);
                    const ty = yFalse;
                    const th = Math.max(0.5, falseH);
                    const bx = x;
                    const bw = barWidth;
                    const d = `M${bx},${ty + r} Q${bx},${ty} ${bx + r},${ty} L${bx + bw - r},${ty} Q${bx + bw},${ty} ${bx + bw},${ty + r} L${bx + bw},${ty + th} L${bx},${ty + th} Z`;
                    return (
                      <motion.path
                        key={`f-` + i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.02, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        style={{ originY: 1 }}
                        d={d}
                        fill="var(--sparkline-false)"
                      />
                    );
                  })()
                )}
                {trueH > 0.5 && (() => {
                  const r = Math.min(2, barWidth * 0.35);
                  const ty = yTrue;
                  const th = Math.max(0.5, trueH);
                  const bx = x;
                  const bw = barWidth;
                  const d = `M${bx},${ty + r} Q${bx},${ty} ${bx + r},${ty} L${bx + bw - r},${ty} Q${bx + bw},${ty} ${bx + bw},${ty + r} L${bx + bw},${ty + th} L${bx},${ty + th} Z`;
                  return (
                    <motion.path
                      key={`t-` + i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.02 + 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ originY: 1 }}
                      d={d}
                      fill="var(--sparkline-true)"
                    />
                  );
                })()}
              </g>
            );
          })}
          <line
            x1="0"
            y1={height}
            x2={width}
            y2={height}
            stroke="var(--color-muted-foreground)"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
        </svg>
      </motion.div>
    </div>
  );
});

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
        className="flex items-end justify-center gap-[1.5px] pb-1 h-full"
      >
        {heights.map((h, i) => (
          <div
            key={i}
            className="w-[1.5px] rounded-t-[1px] bg-sparkline-true/6 dark:bg-sparkline-true/10"
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </motion.div>
    </div>
  );
}
