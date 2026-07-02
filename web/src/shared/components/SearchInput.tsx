import { useT } from '@/i18n';
import { Search } from '@/shared/icons';

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className = '' }: SearchInputProps) {
  const t = useT();
  return (
    <div className={`relative flex-1 max-w-md ${className}`}>
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
      />
      <input
        type="text"
        data-search-input
        placeholder={placeholder ?? t('common.search')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-16 py-2 text-sm bg-input-background border border-border rounded-lg focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-foreground/80 placeholder:text-muted-foreground transition-[color,box-shadow]"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted-foreground/60 bg-secondary rounded border border-border pointer-events-none select-none">
        {isMac ? '⌘' : 'Ctrl+'}K
      </kbd>
    </div>
  );
}
