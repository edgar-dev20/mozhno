import { Plus } from '@/shared/icons';

interface FabProps {
  onClick: () => void;
  label: string;
}

export function Fab({ onClick, label }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="sm:hidden fixed bottom-6 right-4 z-30 size-14 rounded-2xl bg-gradient-to-br from-gradient-start to-gradient-end text-primary-foreground shadow-lg shadow-brand/30 active:scale-95 transition-transform duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      aria-label={label}
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  );
}
