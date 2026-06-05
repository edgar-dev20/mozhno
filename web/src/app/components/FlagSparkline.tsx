import React, { useRef, useEffect, useState } from 'react';

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
      <div className="flex items-center justify-center text-[10px] text-neutral-400" style={{ height }}>
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
                <rect x={x} y={yFalse} width={barWidth} height={Math.max(0.5, falseH)} rx="1" fill="#c4b5fd" />
              )}
              {trueH > 0 && (
                <rect x={x} y={yTrue} width={barWidth} height={Math.max(0.5, trueH)} rx="1" fill="#8b5cf6" />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function aggregateMetricsByFlag(metrics: { flagId: number; evaluationTrueCount: number; evaluationFalseCount: number; timeBucket: string }[]): { totalTrue: number; totalFalse: number; buckets: { trueCount: number; falseCount: number; timeBucket: string }[] } {
  let totalTrue = 0;
  let totalFalse = 0;
  const buckets = metrics.map(m => {
    totalTrue += m.evaluationTrueCount;
    totalFalse += m.evaluationFalseCount;
    return { trueCount: m.evaluationTrueCount, falseCount: m.evaluationFalseCount, timeBucket: m.timeBucket };
  });
  return { totalTrue, totalFalse, buckets };
}
