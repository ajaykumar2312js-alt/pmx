import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { Priority } from '../../../common/enums';

export interface PriorityOption {
  label: string;
  value: Priority;
}

export interface PriorityDropdownProps {
  value: Priority | string;
  onChange: (newValue: Priority) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const OPTIONS: PriorityOption[] = [
  { label: 'Low', value: Priority.LOW },
  { label: 'Medium', value: Priority.MEDIUM },
  { label: 'High', value: Priority.HIGH },
];

const COLOR_MAP: Record<string, { bg: string; color: string }> = {
  [Priority.LOW]: { bg: 'var(--color-status-green-bg, #e3fcef)', color: 'var(--color-status-green-fg, #006644)' },
  [Priority.MEDIUM]: { bg: 'var(--color-status-yellow-bg, #fffae6)', color: 'var(--color-status-yellow-fg, #ff8b00)' },
  [Priority.HIGH]: { bg: 'var(--color-status-red-bg, #ffebe6)', color: 'var(--color-status-red-fg, #de350b)' },
};

/**
 * A modern, custom interactive dropdown that renders as a premium priority pill.
 * Clicking it toggles a sleek, animated popover menu for selecting priority.
 * Rendered via React Portal to prevent overflow clipping by parent containers.
 */
export const PriorityDropdown: React.FC<PriorityDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  // Map value to priority type
  const normalizedValue = String(value).toUpperCase() as Priority;
  const currentColors = COLOR_MAP[normalizedValue] || COLOR_MAP[Priority.LOW];
  
  // Find display label for the pill
  const currentOption = OPTIONS.find((o) => o.value === normalizedValue);
  const displayLabel = currentOption ? currentOption.label : value;

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Recalculate position when opened or window size changes
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    updatePosition();

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScrollOrResize, true); // capture phase
      window.addEventListener('resize', handleScrollOrResize);
    }

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (newValue: Priority, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(newValue);
    setIsOpen(false);
  };

  const menuElement = isOpen && (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: `${coords.top + 6}px`,
        left: `${coords.left}px`,
        minWidth: '150px',
        backgroundColor: 'var(--color-neutral-50, #ffffff)',
        border: '1px solid var(--border-color, #e4e4e7)',
        borderRadius: 'var(--border-radius-base, 8px)',
        boxShadow: 'var(--shadow-md, 0 8px 20px -4px rgba(9, 9, 11, 0.08))',
        padding: '0.375rem',
        zIndex: 9999, // Super high z-index for portals
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        animation: 'fadeInSlideDown 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(8px)',
        background: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      {OPTIONS.map((opt) => {
        const optColors = COLOR_MAP[opt.value];
        const isSelected = opt.value === normalizedValue;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={(e) => handleSelect(opt.value, e)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: 'var(--font-size-sm, 0.8125rem)',
              fontWeight: isSelected ? 600 : 500,
              color: isSelected ? 'var(--color-neutral-900, #09090b)' : 'var(--color-neutral-600, #52525b)',
              backgroundColor: isSelected ? 'var(--color-neutral-100, #fafafa)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--border-radius-sm, 6px)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'var(--color-neutral-100, #fafafa)';
                e.currentTarget.style.color = 'var(--color-neutral-900, #09090b)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-neutral-600, #52525b)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: optColors.color,
                }} 
              />
              <span>{opt.label}</span>
            </div>
            {isSelected && <Check size={12} style={{ color: 'var(--color-primary, #7c3aed)' }} />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: size === 'sm' ? '0.25rem 0.6rem' : '0.375rem 0.8rem',
          borderRadius: 'var(--border-radius-full, 9999px)',
          fontSize: size === 'sm' ? 'var(--font-size-xs, 0.6875rem)' : 'var(--font-size-sm, 0.8125rem)',
          fontWeight: 600,
          backgroundColor: currentColors.bg,
          color: currentColors.color,
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '1px solid transparent',
          borderColor: isHovered && !disabled ? currentColors.color : 'transparent',
          boxShadow: isOpen ? '0 0 0 2px var(--color-primary-50, #ede9fe)' : 'none',
          transform: isHovered && !disabled ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: disabled ? 0.6 : 1,
          whiteSpace: 'nowrap',
          outline: 'none',
        }}
      >
        <span 
          style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            backgroundColor: currentColors.color,
            display: 'inline-block',
            transition: 'transform 0.2s ease',
            transform: isHovered && !disabled ? 'scale(1.3)' : 'scale(1)',
          }} 
        />
        <span>{displayLabel}</span>
        <ChevronDown 
          size={size === 'sm' ? 12 : 14} 
          style={{ 
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: 0.8,
          }} 
        />
      </button>

      {isOpen && createPortal(menuElement, document.body)}
      
      <style>{`
        @keyframes fadeInSlideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
