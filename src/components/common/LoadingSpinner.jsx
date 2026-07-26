import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export default function LoadingSpinner({ size = 'md', fullPage = false, label }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={cn('animate-spin text-blue-500', SIZE_CLASSES[size])} />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        {spinner}
      </div>
    );
  }

  return spinner;
}
