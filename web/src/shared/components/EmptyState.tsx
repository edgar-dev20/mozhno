import React from 'react';
import { GradientButton } from "@/shared/components/GradientButton";
import { Plus } from "@/shared/icons";
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, buttonLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-border rounded-xl px-6 py-16 text-center shadow-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-gradient-subtle-start/10 to-gradient-subtle-end/6">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        {buttonLabel && onAction && (
          <GradientButton onClick={onAction} icon={<Plus size={14} />}>{buttonLabel}</GradientButton>
        )}
      </div>
    </motion.div>
  );
}
