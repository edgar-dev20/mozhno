import React from 'react';
import { GradientButton } from "@/shared/components/GradientButton";
import { Plus } from "@/shared/icons";
import { motion } from 'motion/react';
import { Card } from "@/shared/components/Card";

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
    >
      <Card padded className="px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-5 max-w-xs mx-auto">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center bg-secondary/30 ring-1 ring-border/50">
            {icon}
          </div>
          <div>
            <p className="text-h3 font-heading text-foreground">{title}</p>
            <p className="text-body-sm text-muted-foreground mt-1.5 leading-body">{description}</p>
          </div>
          {buttonLabel && onAction && (
            <GradientButton onClick={onAction} icon={<Plus size={14} />}>{buttonLabel}</GradientButton>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
