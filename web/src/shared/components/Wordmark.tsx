type WordmarkSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<WordmarkSize, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

interface WordmarkProps {
  text: string;
  size?: WordmarkSize;
  className?: string;
}

export function Wordmark({ text, size = 'lg', className = '' }: WordmarkProps) {
  return (
    <div
      className={`font-mono font-semibold tracking-logo select-none ${SIZE_CLASSES[size]} ${className}`}
    >
      <span className="bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent">
        {text}
      </span>
      <span className="bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent text-[0.55em] -ml-[0.35em]">
        .
      </span>
    </div>
  );
}
