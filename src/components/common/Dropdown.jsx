import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/helpers';

// Generic single-select dropdown used by filters, header menus, etc.
// options: [{ label, value }]
export default function Dropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="input-base w-full flex items-center justify-between gap-2"
      >
        <span className={selected ? 'text-slate-200' : 'text-slate-500'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn('w-4 h-4 text-slate-500 transition-transform shrink-0', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <span className="capitalize">{option.label}</span>
              {option.value === value && <Check className="w-4 h-4 text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
