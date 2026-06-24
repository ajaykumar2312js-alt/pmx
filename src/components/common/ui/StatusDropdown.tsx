import React, { useState } from 'react';

export interface StatusOption {
  label: string;
  value: string;
}

export interface StatusDropdownProps {
  value: string;
  options: StatusOption[];
  onChange: (newValue: string) => void;
  /** Custom mapping from status value to colors. Defaults to neutral gray. */
  colorMap?: Record<string, { bg: string; color: string }>;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

/**
 * An inline dropdown that renders as a pill. Clicking it opens a native
 * <select> picker seamlessly. Built for lists and detail headers.
 */
export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  value,
  options,
  onChange,
  colorMap = {},
  disabled = false,
  size = 'md',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Fallback default style if color map is missing the specific status
  const currentColors = colorMap[value] || { bg: '#f1f5f9', color: '#475569' };
  
  // Find display label for the pill
  const currentOption = options.find((o) => String(o.value) === String(value));
  const displayLabel = currentOption ? currentOption.label : value;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.6rem',
        borderRadius: 9999,
        fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
        fontWeight: size === 'sm' ? 600 : 700,
        backgroundColor: currentColors.bg,
        color: currentColors.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px solid transparent',
        borderColor: isHovered && !disabled ? currentColors.color : 'transparent',
        transition: 'border-color 0.15s, opacity 0.15s',
        opacity: disabled ? 0.7 : 1,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span>{displayLabel}</span>
      
      {!disabled && (
        <select
          value={value}
          onChange={handleSelectChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            appearance: 'none',
          }}
          title={`Change status (current: ${displayLabel})`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
