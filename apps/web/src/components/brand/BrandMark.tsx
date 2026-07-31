import { BookOpenText } from 'lucide-react';

interface BrandMarkProps {
  compact?: boolean;
  inverse?: boolean;
}

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl shadow-sm ${
          inverse ? 'bg-white/12 text-teal-200 ring-1 ring-white/15' : 'bg-teal-700 text-white'
        }`}
      >
        <BookOpenText className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
      </span>
      {!compact && (
        <span className={`font-display text-xl font-semibold tracking-[-0.025em] ${inverse ? 'text-white' : 'text-slate-950'}`}>
          Immerli
        </span>
      )}
    </span>
  );
}
