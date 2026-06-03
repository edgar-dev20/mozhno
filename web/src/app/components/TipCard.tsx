import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TipCardProps {
  accentColor: string;
  accentColor2: string;
  text: string;
  label?: string;
  icon?: React.ReactNode;
  imageSrc?: string;
  storageKey?: string;
}

export function TipCard({ accentColor, accentColor2, text, label = 'Совет', icon, imageSrc, storageKey }: TipCardProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (storageKey) {
      setDismissed(localStorage.getItem(`tip-${storageKey}`) === 'dismissed');
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    if (storageKey) {
      localStorage.setItem(`tip-${storageKey}`, 'dismissed');
    }
  };

  const showIcon = icon || imageSrc;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative overflow-hidden rounded-2xl border backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, ${accentColor}0D, ${accentColor2}08)`,
            borderColor: `${accentColor}22`,
            boxShadow: `0 0 40px ${accentColor}10, inset 0 1px 0 ${accentColor}14`,
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${accentColor}, ${accentColor2})`,
              boxShadow: `0 0 14px ${accentColor}80, 0 0 28px ${accentColor}3D`,
            }}
          />
          <div className="p-4 pl-6 flex items-start gap-3">
            {showIcon && (
              <div
                className="shrink-0 rounded-xl overflow-hidden"
                style={{
                  boxShadow: `0 4px 16px ${accentColor}1A`,
                }}
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt=""
                    className="w-10 h-10 object-cover"
                  />
                ) : icon ? (
                  <div
                    className="p-2.5"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}1A, ${accentColor2}11)`,
                    }}
                  >
                    {React.cloneElement(icon as React.ReactElement<{ size?: number; className?: string; style?: React.CSSProperties }>, { size: 16, style: { color: accentColor }, className: undefined })}
                  </div>
                ) : null}
              </div>
            )}
            <div className="flex-1 min-w-0 pt-0.5">
              <span
                className="inline-block text-[10px] font-extrabold uppercase tracking-[0.2em] px-2 py-0.5 rounded-md mb-1.5"
                style={{
                  color: accentColor,
                  background: `${accentColor}12`,
                  border: `1px solid ${accentColor}22`,
                }}
              >
                {label}
              </span>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{text}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}