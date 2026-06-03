import React from 'react';
import { Lightbulb } from 'lucide-react';

interface TipCardProps {
  accentColor: string;
  accentColor2: string;
  text: string;
}

export function TipCard({ accentColor, accentColor2, text }: TipCardProps) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundImage: `linear-gradient(to bottom, ${accentColor}, ${accentColor2})` }}
      />
      <div className="p-4 pl-5 flex items-start gap-3">
        <div
          className="p-2 rounded-xl shrink-0 border"
          style={{
            backgroundImage: `linear-gradient(135deg, ${accentColor}14, ${accentColor2}14)`,
            borderColor: `${accentColor}33`,
          }}
        >
          <Lightbulb size={18} style={{ color: accentColor }} />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: accentColor }}>Совет</span>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}