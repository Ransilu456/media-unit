'use client';

import { ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface DropdownSelectProps<T extends string> {
  id?: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
  className?: string;
}

export function DropdownSelect<T extends string>({
  id,
  value,
  options,
  onChange,
  ariaLabel,
  ariaDescribedBy,
  disabled = false,
  className = '',
}: DropdownSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const trigger = buttonRef.current;
      if (!trigger) return;
      const bounds = trigger.getBoundingClientRect();
      const belowSpace = window.innerHeight - bounds.bottom - 12;
      const aboveSpace = bounds.top - 12;
      const openAbove = belowSpace < 180 && aboveSpace > belowSpace;
      const maxHeight = Math.max(80, Math.min(256, openAbove ? aboveSpace : belowSpace));
      const width = Math.min(window.innerWidth - 16, Math.max(bounds.width, 192));
      setMenuPosition({
        top: openAbove ? Math.max(8, bounds.top - maxHeight - 6) : bounds.bottom + 6,
        left: Math.max(8, Math.min(bounds.left, window.innerWidth - width - 8)),
        width,
        maxHeight,
      });
    };
    const handlePointerDown = (event: MouseEvent) => {
      if (
        event.target instanceof Node
        && !rootRef.current?.contains(event.target)
        && !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  const moveActive = (direction: 1 | -1) => {
    let nextIndex = activeIndex;
    for (let attempt = 0; attempt < options.length; attempt += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;
      if (!options[nextIndex].disabled) {
        setActiveIndex(nextIndex);
        return;
      }
    }
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          const selectedIndex = options.findIndex((option) => option.value === value);
          setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
          if (!open) setMenuPosition(null);
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const selectedIndex = options.findIndex((option) => option.value === value);
            setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
            if (!open) {
              setMenuPosition(null);
              setOpen(true);
            }
            else moveActive(event.key === 'ArrowDown' ? 1 : -1);
          } else if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
        className={twMerge('flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm text-slate-800 shadow-sm outline-none transition hover:border-orange-300 hover:bg-orange-50/40 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50', className)}
      >
        <span className="truncate">{selectedOption?.label ?? value}</span>
        <ChevronDown size={16} aria-hidden="true" className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && menuPosition && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={ariaLabel}
          style={{
            position: 'fixed',
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight,
          }}
          className="z-[120] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.16)]"
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              moveActive(event.key === 'ArrowDown' ? 1 : -1);
            } else if (event.key === 'Escape') {
              event.preventDefault();
              setOpen(false);
              buttonRef.current?.focus();
            } else if (event.key === 'Tab') {
              setOpen(false);
            }
          }}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => { optionRefs.current[index] = element; }}
              type="button"
              role="option"
              aria-selected={option.value === value}
              disabled={option.disabled}
              tabIndex={-1}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
                buttonRef.current?.focus();
              }}
              className={`flex min-h-9 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                option.value === value
                  ? 'bg-orange-50 font-semibold text-orange-900'
                  : 'text-slate-700 hover:bg-slate-50'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && <Check size={15} aria-hidden="true" className="shrink-0 text-orange-700" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
