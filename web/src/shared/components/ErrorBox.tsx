import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from '@/shared/icons';

interface ErrorBoxProps {
  children: React.ReactNode;
  className?: string;
}

export function ErrorBox({ children, className = '' }: ErrorBoxProps) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-body text-destructive ${className}`}
    >
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <span className="min-w-0">{children}</span>
    </motion.div>
  );
}
